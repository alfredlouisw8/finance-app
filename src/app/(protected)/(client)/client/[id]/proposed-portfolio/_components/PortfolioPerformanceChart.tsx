"use client";

import MixedLineChart from "@/components/MixedLineChart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { timeframes } from "@/utils/consts";
import {
	getAllDates,
	getDaysBetweenDates,
	getHoldingsPerformance,
} from "@/utils/functions";
import { Holding } from "@prisma/client";
import axios from "axios";
import { format, sub } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
	startingDate: string;
	portfolioId: string;
};

export default function PortfolioPerformanceChart({
	startingDate,
	portfolioId,
}: Props) {
	const [month, setMonth] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const scrollPosition = useRef(0);

	const startDate = useMemo(
		() => sub(new Date(startingDate), { months: month }),
		[startingDate, month]
	);
	const endDate = format(new Date(), "P");

	const numOfDays = useMemo(
		() => getDaysBetweenDates(startDate, endDate),
		[startDate, endDate]
	);

	const [chartPerformances, setChartPerformances] = useState({
		indexIDPerformance: [1],
		portfolioPerformance: [1],
		indexUSPerformance: [1],
		dateData: [""],
	});

	useEffect(() => {
		async function handleChartPerformances() {
			setIsLoading(true);
			const performances = await axios.post("/api/performance", {
				portfolioId,
				startDate,
			});

			setChartPerformances(performances.data);
			setIsLoading(false);
		}

		handleChartPerformances();
	}, [startDate, portfolioId]);

	useEffect(() => {
		// Save scroll position before component unmounts
		const handleScroll = () => {
			scrollPosition.current = window.scrollY;
		};
		window.addEventListener("scroll", handleScroll);

		// Restore scroll position after rerender
		window.scrollTo(0, scrollPosition.current);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [chartPerformances]);

	const data = {
		labels: chartPerformances.dateData,
		datasets: [
			{
				label: "^JKSE",
				data: chartPerformances.indexIDPerformance,
				borderColor: "blue",
				fill: false,
			},
			{
				label: "^SPX",
				data: chartPerformances.indexUSPerformance,
				borderColor: "red",
				fill: false,
			},
			{
				label: "Portfolio",
				data: chartPerformances.portfolioPerformance,
				borderColor: "orange",
				fill: false,
			},
		],
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex">
				{timeframes.map((item) => (
					<Button
						key={item.text}
						variant={month === item.value ? "default" : "ghost"}
						onClick={() => setMonth(item.value)}
					>
						{item.text}
					</Button>
				))}
			</div>
			<Skeleton className={`w-full aspect-[2/1] ${!isLoading && "hidden"}`} />
			<MixedLineChart
				data={data}
				numOfDays={numOfDays}
				className={`${isLoading && "hidden"}`}
			/>
		</div>
	);
}
