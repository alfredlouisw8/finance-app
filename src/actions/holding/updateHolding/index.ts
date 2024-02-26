"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateHolding } from "./schema";
import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import yahooFinance from "yahoo-finance2";
import { sub } from "date-fns";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let portfolio, holding;

	const {
		portfolioId,
		amount,
		averageBuyPrice,
		ticker,
		type,
		userId,
		holdingId,
	} = data;

	try {
		const quote = await yahooFinance.quote(ticker, {
			fields: ["symbol", "displayName"],
		});

		if (!quote) {
			throw new Error("Ticker not found");
		}

		[holding, portfolio] = await prisma.$transaction([
			prisma.holding.update({
				where: {
					id: holdingId,
				},
				data: {
					ticker,
					amount,
					averageBuyPrice,
					type,
				},
			}),

			prisma.portfolio.update({
				where: {
					id: portfolioId,
				},
				data: {
					updatedAt: new Date(),
				},
			}),
		]);
	} catch (error: any) {
		console.log(error);
		return {
			error: error.message || "Failed to update holding.",
		};
	}

	revalidatePath(`/client/${userId}/current-portfolio`);
	return { data: holding };
};

export const updateHolding = createSafeAction(UpdateHolding, handler);
