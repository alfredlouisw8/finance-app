"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import csvParser from "csv-parser";
import { getHoldingType, getUpdatedTicker } from "@/utils/functions";
import YahooFinance from "@/lib/yahoo-finance";

async function upsertHoldingUniverse(ticker: string, userId: string) {
	const type = getHoldingType(ticker);
	const updatedTicker = getUpdatedTicker(ticker, type);

	//search for existing holding universe
	const holdingUniverse = await prisma.holdingUniverse.findFirst({
		where: {
			ticker: updatedTicker.toUpperCase(),
			userId: userId,
		},
	});

	if (holdingUniverse) {
		return; //if exist return
	}

	const search = await YahooFinance.search(updatedTicker);

	if (!search) {
		return; //ticker not found
	}

	await prisma.holdingUniverse.create({
		data: {
			name: search.longName,
			ticker: updatedTicker.toUpperCase(),
			type,
			userId,
		},
	});
}

export async function uploadHoldingUniverse(prevState: any, data: FormData) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			message: "Unauthorized",
			success: false,
			error: true,
		};
	}

	try {
		const file: File | null = data.get("file") as unknown as File; // this is the csv file
		const userId = data.get("userId") as string;

		if (!file) {
			throw new Error("No file uploaded");
		}

		// Check file type
		const validFileTypes = [
			"text/csv",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"application/vnd.ms-excel",
		];

		if (!validFileTypes.includes(file.type)) {
			throw new Error(
				"Invalid file type. Only CSV, XLS, and XLSX files are allowed."
			);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Create a stream from the buffer
		const stream = require("stream");
		const bufferStream = new stream.PassThrough();
		bufferStream.end(buffer);

		// Use csv-parser to process the buffer stream
		const results: any = [];

		bufferStream
			.pipe(
				csvParser({
					mapHeaders: ({ header, index }) => header.toLowerCase(),
				})
			)
			.on("data", (data: any) => {
				results.push(data);
			})
			.on("end", async () => {
				// You can now work with the parsed CSV data
				for (const row of results) {
					if (row.ticker) {
						await upsertHoldingUniverse(row.ticker, userId);
					}
				}
			})
			.on("error", (error: any) => {
				console.error("Error processing CSV:", error);
				throw new Error("Error processing CSV: " + error);
			});

		revalidatePath(`/client/${userId}/holding-universe`);

		return {
			message:
				"CSV processed successfully. Please refresh the page after a while.",
			success: true,
			error: false,
		};
	} catch (error: any) {
		console.log("error", error.message);
		return {
			message: error.message || "Failed to upload csv",
			success: false,
			error: true,
		};
	}
}
