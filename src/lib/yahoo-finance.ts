"use server";

import {
	ChartReturnType,
	ErrorText,
	QuoteReturnType,
} from "@/types/YahooFinance";
import {
	chartDummyData,
	multiQuoteDummyData,
	quoteDummyData,
} from "@/utils/consts";
import axios from "axios";

const dummyData = process.env.RAPIDAPI_DUMMY_DATA;

class YahooFinance {
	private static cache: { [key: string]: any } = {};
	static async makeRequest(
		url: string,
		retryFn: Function,
		fallbackData: any
	): Promise<any> {
		if (dummyData) return { data: fallbackData };

		const currentUrl = `https://${process.env.RAPIDAPI_HOST}/${url}`;
		const options = {
			method: "GET",
			url: currentUrl,
			headers: {
				"X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
				"X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
			},
		};

		const cacheKey = url + new Date().toDateString();
		if (YahooFinance.cache[cacheKey]) {
			return YahooFinance.cache[cacheKey];
		}

		const promise = axios.request(options);
		YahooFinance.cache[cacheKey] = promise;

		try {
			const response = await promise;
			return response;
		} catch (error: any) {
			if (
				error.response &&
				error.response.status === 429 &&
				error.response.statusText === ErrorText.TOO_MANY_REQUESTS
			) {
				// Too Many Requests - Retry after 1 second
				await new Promise((resolve) => setTimeout(resolve, 1000));
				return retryFn();
			} else {
				console.log(error.response?.data?.message);
				//throw new Error(error.response?.data?.message);
			}
		}
	}

	static async quote(ticker: string): Promise<QuoteReturnType> {
		console.log("quote", ticker);
		const response = await this.makeRequest(
			`price/${ticker}`,
			() => this.quote(ticker),
			quoteDummyData
		);

		return {
			regularMarketPrice: response.data.regularMarketPrice.raw,
			longName: response.data.longName,
		};
	}

	static async multiQuote(tickers: string[]): Promise<QuoteReturnType[]> {
		console.log("multiQuote", tickers);

		const response = await this.makeRequest(
			`multi-quote/${tickers.join(",")}`,
			() => this.multiQuote(tickers),
			multiQuoteDummyData
		);

		return Object.values(response.data).map((result: any) => {
			return {
				regularMarketPrice: result.regularMarketPrice.raw,
				longName: result.longName,
			};
		});
	}

	static async chart(
		ticker: string,
		interval: string,
		range: string
	): Promise<ChartReturnType> {
		console.log("chart", ticker, interval, range);
		const response = await this.makeRequest(
			`historic/${ticker}/${interval}/${range}`,
			() => this.chart(ticker, interval, range),
			chartDummyData
		);

		return {
			chartPreviousClose: response.data?.meta?.chartPreviousClose || 0,
			regularMarketPrice: response.data?.meta?.regularMarketPrice || 0,
			pricesData:
				response.data?.indicators?.adjclose[0]?.adjclose?.filter(Number) || [],
		};
	}
}

export default YahooFinance;
