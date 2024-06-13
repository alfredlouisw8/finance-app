"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { CreateHoldingUniverse } from "./schema";
import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sub } from "date-fns";
import YahooFinance from "@/lib/yahoo-finance";
import { getHoldingType, getUpdatedTicker } from "@/utils/functions";
import { HoldingType } from "@prisma/client";

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

	return await prisma.holdingUniverse.create({
		data: {
			name: search.longName,
			ticker: updatedTicker.toUpperCase(),
			type,
			userId,
		},
	});
}

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let holdingUniverse;

	const { ticker, userId } = data;

	//ticker can be delimited by ;
	const tickers = ticker.replace(/\s+/g, "").split(";");

	for (const ticker of tickers) {
		try {
			holdingUniverse = await upsertHoldingUniverse(ticker, userId);
		} catch (error: any) {
			console.log(error);
			return {
				error: error.message || "Failed to create holding universe.",
			};
		}
	}

	revalidatePath(`/client/${userId}/holding-universe`);
	return { data: holdingUniverse };
};

export const createHoldingUniverse = createSafeAction(
	CreateHoldingUniverse,
	handler
);
