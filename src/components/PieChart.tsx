"use client";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	ChartData,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({
	data,
}: {
	data: ChartData<"pie", number[], unknown>;
}) {
	return <Pie data={data} />;
}
