"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { CreateHoldingUniverse } from "./schema";
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

	let holdingUniverse;

	const { ticker, type, userId } = data;

	try {
		const quote = await yahooFinance.quote(ticker, {
			fields: ["symbol", "displayName"],
		});

		if (!quote) {
			throw new Error("Ticker not found");
		}

		holdingUniverse = await prisma.holdingUniverse.create({
			data: {
				ticker,
				type,
				userId,
			},
		});
	} catch (error: any) {
		console.log(error);
		return {
			error: error.message || "Failed to create holding universe.",
		};
	}

	revalidatePath(`/client/${userId}/holding-universe`);
	return { data: holdingUniverse };
};

export const createHoldingUniverse = createSafeAction(
	CreateHoldingUniverse,
	handler
);
