import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../../../../../components/ui/button";
import Link from "next/link";
import PieChart from "../../../../../components/PieChart";

import { Role } from "@/types/User";
import { User } from "@prisma/client";
import AssetAllocationForm from "./AssetAllocationForm";
import yahooFinance from "yahoo-finance2";
import { sub } from "date-fns";
import { getAnnualizedReturn } from "@/utils/functions";

type Props = {
	user: User;
	currentRole: Role;
};

export default async function RiskProfileSection({ user, currentRole }: Props) {
	const equities = user.equityAllocation || 50;
	const fixedIncome = 100 - equities;

	const pieChartData = {
		labels: ["Risky Asset ", "Fixed Income "],
		datasets: [
			{
				label: "percentage",
				data: [equities, fixedIncome],
				backgroundColor: ["rgba(255, 99, 132)", "rgba(54, 162, 235)"],
			},
		],
	};

	const annualized5YearReturn = await yahooFinance.chart("^JKSE", {
		period1: sub(new Date(), {
			years: 5,
		}),
		interval: "1d",
	});
	const annualized3YearReturn = await yahooFinance.chart("^JKSE", {
		period1: sub(new Date(), {
			years: 3,
		}),
		interval: "1d",
	});
	const annualized1YearReturn = await yahooFinance.chart("^JKSE", {
		period1: sub(new Date(), {
			years: 1,
		}),
		interval: "1d",
	});

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between">
				<CardTitle>Risk Profile: {user.riskProfile}</CardTitle>
				<div className="flex items-center gap-5">
					{currentRole === Role.ADVISOR && (
						<>
							<Link href={`/client/${user.id}/risk-profile-survey`}>
								<Button>Take Risk Profile Survey</Button>
							</Link>

							<Dialog>
								<DialogTrigger asChild>
									<Button>Edit Asset Allocation</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Asset Allocation</DialogTitle>
									</DialogHeader>

									<AssetAllocationForm equities={equities} clientId={user.id} />
								</DialogContent>
							</Dialog>
						</>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex justify-center max-w-[300px] mx-auto">
					<PieChart data={pieChartData} />
				</div>
				<div className="flex flex-col">
					<p>
						Annualized Return 1y ={" "}
						{getAnnualizedReturn(annualized1YearReturn, 1).toFixed(2)}
					</p>
					<p>
						Annualized Return 3y ={" "}
						{getAnnualizedReturn(annualized3YearReturn, 3).toFixed(2)}
					</p>
					<p>
						Annualized Return 5y ={" "}
						{getAnnualizedReturn(annualized5YearReturn, 5).toFixed(2)}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
