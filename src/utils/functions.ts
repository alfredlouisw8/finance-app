import { RiskProfile } from "@/types/User";
import type ChartResultArray from "yahoo-finance2";

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

	const percentageReturn = ((current - start) * 100) / start;

	const annualizedReturn = Math.pow(percentageReturn, 1 / numOfYear);

	return annualizedReturn;
};

function getStandardDeviation(array: number[]) {
	const n = array.length;
	const mean = array.reduce((a, b) => a + b) / n;
	return Math.sqrt(
		array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
	);
}
