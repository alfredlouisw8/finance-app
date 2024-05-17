"use client";

import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	TimeScale
);

export default function MixedLineChart({ data, numOfDays, className }: any) {
	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: "top",
			},
			title: {
				display: true,
				text: "Stocks Performance over the Years",
			},
			tooltip: {
				enabled: false, // Disable tooltips
			},
		},
		hover: {
			mode: null, // Disable hover
		},
		animation: {
			duration: 0, // Disable animations
		},
		scales: {
			x: {
				type: "time",
				time: {
					unit: numOfDays > 366 ? "year" : numOfDays > 30 ? "month" : "day",
				},
				title: {
					display: true,
					text: "Date",
				},
				ticks: {
					source: "auto",
					maxRotation: 0,
					autoSkip: true,
				},
			},
			y: {
				title: {
					display: true,
					text: "Value",
				},
			},
		},
	};

	return (
		<div className={className}>
			<Line data={data} options={options as any} />
		</div>
	);
}
