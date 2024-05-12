export const riskProfileSurvey = [
	{
		question:
			"Please choose your prefered holding period (how long do you tend to hold on to a stock/ a portfolio?).",
		name: "question1",
		image: null,
		weight: 0,
		choices: [
			{
				text: "Less then a year",
				point: 1,
			},
			{
				text: "1-2 year",
				point: 2,
			},
			{
				text: "3-5 year",
				point: 3,
			},
			{
				text: "6-10 year",
				point: 4,
			},
			{
				text: "More than 10 year",
				point: 5,
			},
		],
	},
	{
		question:
			"Generally, I prefer an investment with little ups and downs in value, and I am willing to accept the lower return these investments may make.",
		name: "question2",
		image: null,
		weight: 1,
		choices: [
			{
				text: "Strongly agree",
				point: 1,
			},
			{
				text: "Agree",
				point: 2,
			},
			{
				text: "Neutral",
				point: 3,
			},
			{
				text: "Disagree",
				point: 4,
			},
			{
				text: "Strongly disagree",
				point: 5,
			},
		],
	},
	{
		question:
			"During the previous crisis period, the global stock market loses more than 30% of its value. If I owned a stock that lost about 30% in just a month, I would…",
		name: "question3",
		image: null,
		weight: 5,
		choices: [
			{
				text: "Sell everything",
				point: 1,
			},
			{
				text: "Sell some",
				point: 2,
			},
			{
				text: "Hold",
				point: 4,
			},
			{
				text: "Buy more of the investment",
				point: 5,
			},
		],
	},
	{
		question:
			"When the market goes down, I tend to sell some of my riskier investment and put money into safer investments.",
		name: "question4",
		image: null,
		weight: 5,
		choices: [
			{
				text: "Strongly agree",
				point: 1,
			},
			{
				text: "Agree",
				point: 2,
			},
			{
				text: "Neutral",
				point: 3,
			},
			{
				text: "Disagree",
				point: 4,
			},
			{
				text: "Strongly disagree",
				point: 5,
			},
		],
	},
	{
		question:
			"The chart on the side shows the one year movement of two different hypothetical investments of $1,000. Given the volatility in any one year, I would invest my money in…",
		name: "question5",
		image: "/img/chart1.png",
		weight: 2,
		choices: [
			{
				text: "Blue",
				point: 1,
			},
			{
				text: "Orange",
				point: 3,
			},
			{
				text: "Grey",
				point: 5,
			},
		],
	},
	{
		question:
			"The chart on the side shows the highest one year gain and loss on three different hypothetical investments of $10,000. Given the potential gain/ loss in any one year, I would invest my money in…",
		name: "question6",
		image: "/img/chart2.png",
		weight: 2,
		choices: [
			{
				text: "A",
				point: 1,
			},
			{
				text: "B",
				point: 3,
			},
			{
				text: "C",
				point: 5,
			},
		],
	},
	{
		question:
			"When it comes to investing in the stock market, my level of experience would be…",
		name: "question7",
		image: null,
		weight: 1,
		choices: [
			{
				text: "Very Inexperienced",
				point: 1,
			},
			{
				text: "Little Experience/ Knowledge",
				point: 2,
			},
			{
				text: "Some Experience/ Knowledge",
				point: 3,
			},
			{
				text: "Experienced/ Knowledgable",
				point: 4,
			},
			{
				text: "Very Experienced",
				point: 5,
			},
		],
	},
];

export const pieChartColors = [
	"#FF6666",
	"#FFB266",
	"#FFFF66",
	"#B2FF66",
	"#66FF66",
	"#66FFB2",
	"#66FFFF",
	"#66B2FF",
	"#6666FF",
	"#B266FF",
	"#FF66FF",
	"#FF66B2",
];

export const quoteDummyData = {
	regularMarketPrice: { raw: 100 },
	longName: "Dummy",
};

export const multiQuoteDummyData = {
	"0": { regularMarketPrice: { raw: 16000 }, longName: "USDIDR" },
	"1": { regularMarketPrice: { raw: 100 }, longName: "Dummy" },
};

export const chartDummyData = {
	meta: {
		chartPreviousClose: 100,
		regularMarketPrice: 200,
	},
	indicators: {
		adjclose: [
			{
				adjclose: [100, 120, 130, 140, 150, 160, 170, 180, 190, 200],
			},
		],
	},
};
