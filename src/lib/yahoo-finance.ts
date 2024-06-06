import {
	ChartReturnType,
	ErrorText,
	QuoteReturnType,
} from "@/types/YahooFinance";

import axios from "axios";
import { format, sub } from "date-fns";

class YahooFinance {
	static async search(ticker: string): Promise<QuoteReturnType | null> {
		console.log("search eodhd", ticker);

		try {
			const response = await axios.get(
				`https://eodhd.com/api/search/${ticker}?api_token=${process.env.EODHD_API_KEY}&fmt=json`
			);

			if (response.data.length > 0) {
				return {
					regularMarketPrice: response.data[0].previousClose,
					longName: response.data[0].Name,
				};
			}
		} catch (error) {
			console.log(error);
		}

		return null;
	}

	static async multiSearch(tickers: string[]): Promise<QuoteReturnType[]> {
		console.log("multiSearch eodhd", tickers);

		const firstTicker = tickers[0];
		const otherTickers = tickers.slice(1);

		try {
			const response = await axios.get(
				`https://eodhd.com/api/real-time/${firstTicker}?s=${otherTickers.join(
					","
				)}&api_token=${process.env.EODHD_API_KEY}&fmt=json`
			);

			if (otherTickers.length === 0) {
				return [{ regularMarketPrice: response.data.close }];
			}

			return response.data.map((data: any) => ({
				regularMarketPrice: data.close,
			}));
		} catch (error) {
			console.log(error);
		}

		return [];
	}

	static async historical(
		ticker: string,
		from: string,
		period: string
	): Promise<ChartReturnType> {
		let firstClose, lastClose;
		let pricesData,
			dateData = [];

		const to = format(sub(new Date(), { days: 1 }), "yyyy-MM-dd");

		console.log("historical", ticker, from, to, period);

		try {
			const response = await axios.get(
				`https://eodhd.com/api/eod/${ticker}?from=${from}&to=${to}&period=${period}&api_token=${process.env.EODHD_API_KEY}&fmt=json`
			);

			firstClose = response.data[0].adjusted_close;
			lastClose = response.data[response.data.length - 1].adjusted_close;
			pricesData = response.data.map((data: any) => data.adjusted_close);
			dateData = response.data.map((data: any) => data.date);
		} catch (error) {
			console.log(error);
		}

		return {
			chartPreviousClose: firstClose || 0,
			regularMarketPrice: lastClose || 0,
			pricesData: pricesData || [],
			dateData: dateData || [],
		};
	}
}

export default YahooFinance;
