"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OptimizePortfolio } from "./schema";
import { optimizeCurrentPortfolio } from "./helper/helper";
import prisma from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let portfolio;

	const {
		optimizedWeightJson,
		currentPortfolioId,
		proposedPortfolioId,
		clientId,
	} = data;

	try {
		portfolio = await optimizeCurrentPortfolio(
			optimizedWeightJson,
			currentPortfolioId,
			proposedPortfolioId
		);
	} catch (error) {
		return {
			error: "Failed to optimize portfolio",
		};
	}

	revalidatePath(`/client/${clientId}`);
	return { data: portfolio };
};

export const optimizePortfolio = createSafeAction(OptimizePortfolio, handler);
