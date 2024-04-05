"use server";

import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import {
	getHoldingData,
	getHoldingType,
	getHoldingsData,
} from "@/utils/functions";
import yahooFinance from "yahoo-finance2";
import prisma from "@/lib/prisma";
import { Holding } from "@prisma/client";
import { revalidatePath } from "next/cache";

export default async function optimizePortfolio(
	optimizedWeightJson: string,
	currentPortfolioId: string,
	proposedPortfolioId: string,
	userId: string
) {
	const optimizedWeight: any = Object.fromEntries(
		Object.entries(JSON.parse(optimizedWeightJson)).filter(
			([key, value]) => value !== 0
		)
	);

	const holdings = await getHoldingByPortfolio(currentPortfolioId);
	const holdingsData = await getHoldingsData(holdings);

	const currentTotalPortfolioValue = holdingsData.reduce(
		(acc, val) => acc + val.value,
		0
	);

	let excessCash = 0;

	const proposedHoldings = await Promise.all(
		Object.keys(optimizedWeight).map(async (key) => {
			const optimizedTickerValue =
				optimizedWeight[key] * currentTotalPortfolioValue;

			const tickerType = getHoldingType(key);
			const result = await yahooFinance.quoteSummary(key, {
				modules: ["price"],
			});
			let tickerValue = result.price?.regularMarketPrice as number;
			if (tickerType === "US_STOCK") {
				const USDIDR = await yahooFinance.quote("IDR=X");
				tickerValue *= USDIDR.regularMarketPrice!;
			}
			const tickerAmount = optimizedTickerValue / tickerValue;
			const roundedTickerAmount = Math.floor(tickerAmount);

			excessCash += optimizedTickerValue - roundedTickerAmount * tickerValue;

			return {
				ticker: key,
				amount: roundedTickerAmount,
				type: tickerType,
				averageBuyPrice: result.price?.regularMarketPrice || 0,
				portfolioId: proposedPortfolioId,
			};
		})
	);

	await prisma.$transaction([
		prisma.holding.deleteMany({
			where: {
				portfolioId: proposedPortfolioId,
			},
		}),

		prisma.holding.createMany({
			data: proposedHoldings,
		}),

		prisma.portfolio.update({
			where: {
				id: proposedPortfolioId,
			},
			data: {
				cash: excessCash,
			},
		}),
	]);

	revalidatePath(`/client/${userId}`);
}
