import { HoldingData } from "@/types/Holding";
import { RiskProfile } from "@/types/User";
import { Holding, HoldingType } from "@prisma/client";
import { sub } from "date-fns";
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
	if (x === null) {
		return undefined;
	}
	return x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const getAnnualizedReturn = (chartData: any, numOfYear: number) => {
	const current = chartData.meta.regularMarketPrice;
	const start = chartData.meta.chartPreviousClose;

	const annualizedReturn = current / start - 1;

	return annualizedReturn * 100;
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

	return annualizedVolatility * 100;
}

export function getWeightedPortfolioValue(
	equityValue: number,
	equityWeight: number,
	fixedIncomeValue: number,
	fixedIncomeWeight: number
) {
	return (
		(equityValue * equityWeight + fixedIncomeValue * fixedIncomeWeight) / 100
	);
}

export function getWeightedPortfolioVolatility(
	equityVolatility: number,
	equityWeight: number,
	fixedIncomeVolatility: number,
	fixedIncomeWeight: number
) {
	const variance =
		Math.pow(equityVolatility, 2) * Math.pow(equityWeight / 100, 2) +
		Math.pow(fixedIncomeVolatility, 2) * Math.pow(fixedIncomeWeight / 100, 2);
	const portfolioVolatility = Math.sqrt(variance);

	return portfolioVolatility;
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
		volatility1y: getWeightedPortfolioVolatility(
			equityBenchmarkReturn.volatility1y,
			equityWeight,
			bondsBenchmarkReturn.volatility1y,
			fixedIncomeWeight
		),
		volatility3y: getWeightedPortfolioVolatility(
			equityBenchmarkReturn.volatility3y,
			equityWeight,
			bondsBenchmarkReturn.volatility3y,
			fixedIncomeWeight
		),
		volatility5y: getWeightedPortfolioVolatility(
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

export async function getHoldingsData(
	holdings: Holding[]
): Promise<HoldingData[]> {
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

export async function getHoldingData(holding: Holding): Promise<HoldingData> {
	const USDIDR = await yahooFinance.quote("IDR=X");

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
}

export function getHoldingType(ticker: string) {
	if (ticker.includes(".JK")) {
		return HoldingType.ID_STOCK;
	} else {
		return HoldingType.US_STOCK;
	}
}

// Define a function to calculate logarithmic returns
export function calculateLogReturns(prices: number[]): number[] {
	let returns: number[] = [];
	for (let i = 1; i < prices.length; i++) {
		returns.push(Math.log(prices[i] / prices[i - 1]));
	}
	return returns;
}

// Define a function to calculate covariance
export function calculateCovariance(x: number[], y: number[]): number {
	const xMean = x.reduce((acc, val) => acc + val, 0) / x.length;
	const yMean = y.reduce((acc, val) => acc + val, 0) / y.length;

	let covariance = 0;
	for (let i = 0; i < x.length; i++) {
		if (isNaN(x[i]) || isNaN(y[i])) {
			continue;
		}
		covariance += (x[i] - xMean) * (y[i] - yMean);
	}

	return covariance / (x.length - 1);
}

// Define a function to calculate variance
export function calculateVariance(x: number[]): number {
	const mean = x.reduce((acc, val) => acc + val, 0) / x.length;
	let variance = 0;
	for (let val of x) {
		variance += Math.pow(val - mean, 2);
	}
	return variance / (x.length - 1);
}

// Define the main function to calculate adjusted beta
function stockBetaAdj(stockPrices: number[], indexPrices: number[]): number {
	const stockReturns = calculateLogReturns(stockPrices);
	const indexReturns = calculateLogReturns(indexPrices);

	const cov = calculateCovariance(stockReturns, indexReturns);
	const varIndex = calculateVariance(indexReturns);

	const beta = cov / varIndex;
	const adjBeta = (2 / 3) * beta + 1 / 3;

	return adjBeta;
}

export function getPricesFromChartData(chartData: any) {
	return chartData.quotes.map((data: any) => data.adjclose).filter(Number);
}

export async function getPortfolioBetaValue(
	holdingsData: HoldingData[],
	totalPortfolioValue: number
) {
	const betaAdjStocks = await Promise.all(
		holdingsData.map(async (holding, i) => {
			const stockChartData = await yahooFinance.chart(holding.ticker, {
				period1: sub(new Date(), {
					years: 5,
				}),
				interval: "1mo",
			});

			const stockPrices = getPricesFromChartData(stockChartData);

			let indexTicker = "^JKSE";

			if (holding.type === "US_STOCK") {
				indexTicker = "^SPX";
			} else if (holding.type === "ID_STOCK") {
				indexTicker = "^JKSE";
			}

			const indexChartData = await yahooFinance.chart(indexTicker, {
				period1: sub(new Date(), {
					years: 5,
				}),
				interval: "1mo",
			});

			const indexPrices = getPricesFromChartData(indexChartData);

			return {
				ticker: holding.ticker,
				betaAdj: stockBetaAdj(stockPrices, indexPrices),
				value: holding.value,
			};
		})
	);

	const portfolioBetaAdj =
		betaAdjStocks.reduce((acc, val) => acc + val.value * val.betaAdj, 0) /
		totalPortfolioValue;

	return portfolioBetaAdj;
}
