export type QuoteReturnType = {
	regularMarketPrice: number;
	longName: string;
};

export type ChartReturnType = {
	chartPreviousClose: number;
	regularMarketPrice: number;
	pricesData: number[];
};

export enum ErrorText {
	TOO_MANY_REQUESTS = "Too Many Requests",
}
