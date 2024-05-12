"use server";

import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import YahooFinance from "@/lib/yahoo-finance";
import { getHoldingType, getHoldingsData } from "@/utils/functions";
import { Holding, HoldingType } from "@prisma/client";

export async function calculateTickerValue(
	key: string,
	optimizedWeight: any,
	currentTotalPortfolioValue: number
) {
	const optimizedTickerValue =
		optimizedWeight[key] * currentTotalPortfolioValue;
	const tickerType = getHoldingType(key);

	const results = await YahooFinance.multiQuote(["IDR=X", key]);

	let tickerValue = results[1].regularMarketPrice; // Second result is the holding data
	if (tickerType === HoldingType.US_STOCK) {
		const USDIDR = results[0].regularMarketPrice; // First result is the currency rate
		tickerValue *= USDIDR;
	}
	return {
		tickerValue,
		optimizedTickerValue,
		tickerType,
		averageBuyPrice: results[1].regularMarketPrice,
	};
}

export async function calculateProposedHoldings(
	optimizedWeight: any,
	currentTotalPortfolioValue: number,
	proposedPortfolioId: string
) {
	let excessCash = 0;

	// can be optimized by using multi quote
	const proposedHoldings = await Promise.all(
		Object.keys(optimizedWeight).map(async (key) => {
			const { tickerValue, optimizedTickerValue, tickerType, averageBuyPrice } =
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
				averageBuyPrice,
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
