"use server";

import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import { getHoldingType, getHoldingsData } from "@/utils/functions";
import { Holding, HoldingType } from "@prisma/client";
import yahooFinance from "yahoo-finance2";

export async function calculateTickerValue(
	key: string,
	optimizedWeight: any,
	currentTotalPortfolioValue: number
) {
	const optimizedTickerValue =
		optimizedWeight[key] * currentTotalPortfolioValue;
	const tickerType = getHoldingType(key);
	const result = await yahooFinance.quoteSummary(key, { modules: ["price"] });
	let tickerValue = result.price?.regularMarketPrice as number;
	if (tickerType === HoldingType.US_STOCK) {
		const USDIDR = await yahooFinance.quote("IDR=X");
		tickerValue *= USDIDR.regularMarketPrice!;
	}
	return { tickerValue, optimizedTickerValue, tickerType, result };
}

export async function calculateProposedHoldings(
	optimizedWeight: any,
	currentTotalPortfolioValue: number,
	proposedPortfolioId: string
) {
	let excessCash = 0;

	const proposedHoldings = await Promise.all(
		Object.keys(optimizedWeight).map(async (key) => {
			const { tickerValue, optimizedTickerValue, tickerType, result } =
				await calculateTickerValue(
					key,
					optimizedWeight,
					currentTotalPortfolioValue
				);

			const tickerAmount = optimizedTickerValue / tickerValue;
			let roundedTickerAmount = tickerAmount;

			if (tickerType === HoldingType.ID_STOCK) {
				const excessAmount = Math.floor(tickerAmount) % 100;
				roundedTickerAmount = Math.floor(tickerAmount) - excessAmount;
			}

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

	return { proposedHoldings, excessCash };
}

export async function updateDatabase(
	proposedHoldings: any,
	proposedPortfolioId: string,
	excessCash: number
) {
	const [, , portfolio] = await prisma.$transaction([
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

	return portfolio;
}

export async function optimizeCurrentPortfolio(
	optimizedWeightJson: string,
	currentPortfolioId: string,
	proposedPortfolioId: string
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

	const { proposedHoldings, excessCash } = await calculateProposedHoldings(
		optimizedWeight,
		currentTotalPortfolioValue,
		proposedPortfolioId
	);

	const portfolio = await updateDatabase(
		proposedHoldings,
		proposedPortfolioId,
		excessCash
	);

	return portfolio;
}
