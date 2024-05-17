import YahooFinance from "@/lib/yahoo-finance";
import { HoldingData } from "@/types/Holding";
import { RiskProfile } from "@/types/User";
import { ChartReturnType } from "@/types/YahooFinance";
import { Holding, HoldingType, Portfolio } from "@prisma/client";

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

export const getAnnualizedReturn = (
	chartData: ChartReturnType,
	numOfYear: number
) => {
	const current = chartData.regularMarketPrice;
	const start = chartData.chartPreviousClose;

	const annualizedReturn = current / start - 1;

	return annualizedReturn * 100;
};

export function calculateVolatility(chartData: ChartReturnType) {
	// Calculate daily log returns
	const logReturns = [];
	for (let i = 1; i < chartData.pricesData.length; i++) {
		if (
			chartData.pricesData[i] === null ||
			chartData.pricesData[i - 1] === null
		) {
			continue;
		}

		const logReturn = Math.log(
			chartData.pricesData[i] / chartData.pricesData[i - 1]
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

export async function getBenchmarkTableData(
	equityWeight: number,
	fixedIncomeWeight: number
) {
	const priceData5year = await YahooFinance.chart("^JKSE", "1d", "5y");
	const priceData3year = await YahooFinance.chart("^JKSE", "1d", "3y");
	const priceData1year = await YahooFinance.chart("^JKSE", "1d", "1y");

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

export function calculatePercentage(value: number, totalValue: number) {
	if (!value || !totalValue) {
		return 0;
	}

	return parseFloat(((value / totalValue) * 100).toFixed(2));
}

export async function getHoldingsData(
	holdings: Holding[]
): Promise<HoldingData[]> {
	const tickers = ["IDR=X", ...holdings.map((holding) => holding.ticker)];

	const results = await YahooFinance.multiQuote(tickers);

	const { regularMarketPrice: currencyRate } = results[0];

	return holdings.map((holding, i) => {
		let currentPrice = results[i + 1].regularMarketPrice;
		let longName = results[i + 1].longName;

		if (process.env.RAPIDAPI_DUMMY_DATA) {
			currentPrice = 1000;
			longName = "Dummy " + i;
		}

		return {
			...holding,
			name: longName,
			lastPrice: currentPrice,
			initialValue: getTotalValue(
				holding.averageBuyPrice,
				holding.amount,
				holding.type,
				currencyRate
			),
			value: getTotalValue(
				currentPrice,
				holding.amount,
				holding.type,
				currencyRate
			),
		};
	});
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

export async function getPortfolioBetaValue(
	holdingsData: HoldingData[],
	totalPortfolioValue: number
) {
	const indexPrices = {
		us: await YahooFinance.chart("^SPX", "1mo", "5y"),
		id: await YahooFinance.chart("^JKSE", "1mo", "5y"),
	};

	const betaAdjStocks = await Promise.all(
		holdingsData.map(async (holding, i) => {
			const { pricesData: stockPrices } = await YahooFinance.chart(
				holding.ticker,
				"1mo",
				"5y"
			);

			let indexPricesData = indexPrices.id.pricesData;

			if (holding.type === HoldingType.US_STOCK) {
				indexPricesData = indexPrices.us.pricesData;
			}

			return {
				ticker: holding.ticker,
				betaAdj: stockBetaAdj(stockPrices, indexPricesData),
				value: holding.value,
			};
		})
	);

	const portfolioBetaAdj =
		betaAdjStocks.reduce((acc, val) => acc + val.value * val.betaAdj, 0) /
		totalPortfolioValue;

	return portfolioBetaAdj;
}

export function getAllDates(startDate: string | Date, endDate: string | Date) {
	const dates = [];
	let currentDate = new Date(startDate);
	const end = new Date(endDate);

	while (currentDate <= end) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}

export function getDaysBetweenDates(
	startDate: string | Date,
	endDate: string | Date
) {
	const start = new Date(startDate);
	const end = new Date(endDate);

	const timeDiff = end.getTime() - start.getTime();

	const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
	return Math.floor(daysDiff); // Or Math.ceil(daysDiff) if you want to include partial days
}

export async function getHoldingsPerformance(
	holdings: Holding[],
	startingDate: Date | string
) {
	const startDate = new Date(startingDate);
	const endDate = new Date();

	const numOfDays = getDaysBetweenDates(startDate, endDate);

	const performanceData = [];

	// USDIDR rate
	const results = await YahooFinance.multiQuote(["IDR=X"]);
	const { regularMarketPrice: currencyRate } = results[0];

	for (const holding of holdings) {
		const historicalData = await YahooFinance.chart(
			holding.ticker,
			"1d",
			`${numOfDays}d`
		);
		const prices = historicalData.pricesData.map((price) =>
			getTotalValue(price, holding.amount, holding.type, currencyRate)
		);

		performanceData.push({
			ticker: holding.ticker,
			values: prices,
		});
	}

	const portfolioPerformance = [];
	for (let i = 0; i < numOfDays; i++) {
		let totalPortfolioValue = 0;
		for (const data of performanceData) {
			totalPortfolioValue += data.values[i]; // total portfolio value at given day
		}
		portfolioPerformance.push(totalPortfolioValue);
	}

	const startingPortfolioPerformance = portfolioPerformance[0];

	const normalizedPerformance = portfolioPerformance.map(
		(data) => data / startingPortfolioPerformance
	);

	const indexPerformance = await getIndexPerformance(numOfDays);

	return {
		portfolioPerformance: normalizedPerformance,
		indexPerformance,
	};
}

export async function getIndexPerformance(numOfDays: number, index = "^JKSE") {
	const historicalData = await YahooFinance.chart(index, "1d", `${numOfDays}d`);

	const startingPrice = historicalData.pricesData[0];

	const indexPerformance = historicalData.pricesData.map(
		(data) => data / startingPrice
	);

	return indexPerformance;
}
