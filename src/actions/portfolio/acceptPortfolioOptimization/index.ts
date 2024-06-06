"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AcceptPortfolioOptimization } from "./schema";
import prisma from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let portfolio;

	const { currentPortfolioId, proposedPortfolioId, clientId } = data;

	try {
		portfolio = await prisma.$transaction(async (tx) => {
			// find proposed portfolio holdings
			const proposedHoldings = await tx.holding.findMany({
				where: {
					portfolioId: proposedPortfolioId,
				},
			});

			// delete all current portfolio holdings
			await tx.holding.deleteMany({
				where: {
					portfolioId: currentPortfolioId,
				},
			});

			// duplicate proposed portfolio holdings to current portfolio
			await tx.holding.createMany({
				data: proposedHoldings.map((holding) => {
					return {
						name: holding.name,
						ticker: holding.ticker,
						amount: holding.amount,
						type: holding.type,
						averageBuyPrice: holding.averageBuyPrice,
						portfolioId: currentPortfolioId,
					};
				}),
			});

			// find proposed portfolio
			const proposedPortfolio = await tx.portfolio.findUnique({
				where: {
					id: proposedPortfolioId,
				},
			});

			// update current portfolio cash from proposed portfolio cash
			const currentPortfolio = await tx.portfolio.update({
				where: {
					id: currentPortfolioId,
				},
				data: {
					cash: proposedPortfolio?.cash,
				},
			});

			return currentPortfolio;
		});
	} catch (error) {
		console.log(error);
		return {
			error: "Failed to accept portfolio optimization",
		};
	}

	revalidatePath(`/client/${clientId}`);
	return { data: portfolio };
};

export const acceptPortfolioOptimization = createSafeAction(
	AcceptPortfolioOptimization,
	handler
);
