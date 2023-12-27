"use client";

import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);
export const options = {
	responsive: true,
	plugins: {
		legend: {
			position: "top" as const,
		},
		title: {
			display: true,
			text: "Chart.js Bar Chart",
		},
	},
};

const labels = ["January", "February"];

export const data = {
	labels,
	datasets: [
		{
			label: "Dataset 1",
			data: [50, 50],
			backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(255, 99, 132, 0.5)"],
		},
	],
};

export default function Page() {
	return <Bar options={options} data={data} />;
}
