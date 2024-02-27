import { RiskProfile } from "@/types/User";
import { Holding, HoldingType } from "@prisma/client";
import yahooFinance from "yahoo-finance2";

export const getRiskProfileResult = (totalPoint: number): RiskProfile => {
	if (totalPoint >= 64) {
		return RiskProfile.RISK_SEEKING;
	} else if (totalPoint >= 48) {
		return RiskProfile.SLIGHTLY_RISK_SEEKING;
	} else if (totalPoint >= 32) {
		return RiskProfile.SLIGHTLY_RISK_AVERSE;
	} else {
		return RiskProfile.RISK_AVERSE;
	}
};

export function numberWithCommas(x: number | null) {
	if (!x) {
		return undefined;
	}
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const getAnnualizedReturn = (chartData: any, numOfYear: number) => {
	const current = chartData.meta.regularMarketPrice;
	const start = chartData.meta.chartPreviousClose;

	const percentageReturn = current / start - 1;

	const annualizedReturn = Math.pow(percentageReturn, 1 / numOfYear);

	return annualizedReturn;
};

export function calculateVolatility(chartData: any) {
	// Calculate daily log returns
	const logReturns = [];
	for (let i = 1; i < chartData.quotes.length; i++) {
		if (
			chartData.quotes[i].adjclose === null ||
			chartData.quotes[i - 1].adjclose === null
		) {
			continue;
		}

		const logReturn = Math.log(
			chartData.quotes[i].adjclose / chartData.quotes[i - 1].adjclose
		);

		logReturns.push(logReturn);
	}

	// Calculate the mean of log returns
	const meanLogReturn =
		logReturns.reduce((acc, val) => acc + val, 0) / logReturns.length;

	// Calculate the variance
	const variance =
		logReturns.reduce((acc, val) => acc + Math.pow(val - meanLogReturn, 2), 0) /
		(logReturns.length - 1);

	// Standard deviation (Volatility)
	const stdDev = Math.sqrt(variance);

	// Annualize the volatility
	const annualizedVolatility = stdDev * Math.sqrt(252);

	return annualizedVolatility;
}

export function getWeightedPortfolioValue(
	equityValue: number,
	equityWeight: number,
	fixedIncomeValue: number,
	fixedIncomeWeight: number
) {
	return (
		equityValue * equityWeight + (fixedIncomeValue * fixedIncomeWeight) / 100
	);
}

export function getBenchmarkTableData(
	priceData1year: any,
	priceData3year: any,
	priceData5year: any,
	equityWeight: number,
	fixedIncomeWeight: number
) {
	const bondsBenchmarkReturn = {
		return1y: 8,
		return3y: 9,
		return5y: 7,
		volatility1y: 1.5,
		volatility3y: 2,
		volatility5y: 1.7,
	};

	const equityBenchmarkReturn = {
		return1y: getAnnualizedReturn(priceData1year, 1),
		return3y: getAnnualizedReturn(priceData3year, 3),
		return5y: getAnnualizedReturn(priceData5year, 5),
		volatility1y: calculateVolatility(priceData1year),
		volatility3y: calculateVolatility(priceData3year),
		volatility5y: calculateVolatility(priceData5year),
	};

	const portfolioBenchmarkReturn = {
		return1y: getWeightedPortfolioValue(
			equityBenchmarkReturn.return1y,
			equityWeight,
			bondsBenchmarkReturn.return1y,
			fixedIncomeWeight
		),
		return3y: getWeightedPortfolioValue(
			equityBenchmarkReturn.return3y,
			equityWeight,
			bondsBenchmarkReturn.return3y,
			fixedIncomeWeight
		),
		return5y: getWeightedPortfolioValue(
			equityBenchmarkReturn.return5y,
			equityWeight,
			bondsBenchmarkReturn.return5y,
			fixedIncomeWeight
		),
		volatility1y: getWeightedPortfolioValue(
			equityBenchmarkReturn.volatility1y,
			equityWeight,
			bondsBenchmarkReturn.volatility1y,
			fixedIncomeWeight
		),
		volatility3y: getWeightedPortfolioValue(
			equityBenchmarkReturn.volatility3y,
			equityWeight,
			bondsBenchmarkReturn.volatility3y,
			fixedIncomeWeight
		),
		volatility5y: getWeightedPortfolioValue(
			equityBenchmarkReturn.volatility5y,
			equityWeight,
			bondsBenchmarkReturn.volatility5y,
			fixedIncomeWeight
		),
	};

	return [
		bondsBenchmarkReturn,
		equityBenchmarkReturn,
		portfolioBenchmarkReturn,
	];
}

export function getTotalValue(
	lastPrice: number,
	amount: number,
	type: HoldingType,
	usdidr: number
) {
	let totalValue;
	totalValue = lastPrice * amount;

	if (type === HoldingType.US_STOCK) {
		totalValue = lastPrice * amount * usdidr;
	}

	return totalValue;
}

export function calculatePerformance(startPrice: number, endPrice: number) {
	if (!endPrice || !startPrice) {
		return "N/A";
	}

	return ((endPrice / startPrice - 1) * 100).toFixed(2) + "%";
}

export async function getHoldingsData(holdings: Holding[]) {
	const USDIDR = await yahooFinance.quote("IDR=X");

	return await Promise.all(
		holdings.map(async (holding) => {
			const result = await yahooFinance.quoteSummary(holding.ticker, {
				modules: ["price"],
			});
			return {
				...holding,
				name: result.price?.longName,
				lastPrice: result.price?.regularMarketPrice,
				value: getTotalValue(
					result.price?.regularMarketPrice!,
					holding.amount,
					holding.type,
					USDIDR.regularMarketPrice!
				),
			};
		})
	);
}
