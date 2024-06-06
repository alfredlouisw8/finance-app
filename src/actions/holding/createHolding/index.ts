"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { CreateHolding } from "./schema";
import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sub } from "date-fns";
import YahooFinance from "@/lib/yahoo-finance";
import { getHoldingType, getUpdatedTicker } from "@/utils/functions";
import { HoldingType } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let portfolio, holding;

	const { portfolioId, amount, averageBuyPrice, ticker, userId } = data;

	const type = getHoldingType(ticker);
	const updatedTicker = getUpdatedTicker(ticker, type);

	try {
		const search = await YahooFinance.search(updatedTicker);

		if (!search) {
			throw new Error("Ticker not found");
		}

		[holding, portfolio] = await prisma.$transaction([
			prisma.holding.create({
				data: {
					name: search.longName,
					ticker: updatedTicker.toUpperCase(),
					amount,
					averageBuyPrice,
					portfolioId,
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
			error: error.message || "Failed to create holding.",
		};
	}

	revalidatePath(`/client/${userId}/current-portfolio`);
	return { data: holding };
};

export const createHolding = createSafeAction(CreateHolding, handler);
