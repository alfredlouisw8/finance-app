import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import getPortfolio from "@/actions/portfolio/getPortfolio";
import PieChart from "@/components/PieChart";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Role } from "@/types/User";
import { pieChartColors } from "@/utils/consts";
import {
	calculatePercentage,
	calculatePerformance,
	getHoldingsData,
	getTotalValue,
} from "@/utils/functions";
import { User } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import yahooFinance from "yahoo-finance2";
import AcceptOptimizationForm from "../_components/AcceptOptimizationForm";

type Props = {
	user: User;
	currentRole: Role;
};

export default async function CurrentCompositionSection({
	user,
	currentRole,
}: Props) {
	const holdings = await getHoldingByPortfolio(
		user.currentPortfolioId as string
	);

	const portfolio = await getPortfolio(user.currentPortfolioId as string);

	const quotes = await getHoldingsData(holdings);

	const currentTotalPortfolioValue =
		quotes.reduce((acc, val) => acc + val.value, 0) + portfolio?.cash!;

	const percentageData = [
		...quotes.map((quote) => ({
			ticker: quote.ticker,
			value: calculatePercentage(quote.value, currentTotalPortfolioValue),
		})),
		{
			ticker: "Cash",
			value: calculatePercentage(portfolio?.cash!, currentTotalPortfolioValue),
		},
	];

	const pieChartData = {
		labels: percentageData.map((quote) => quote.ticker),
		datasets: [
			{
				label: "percentage",
				data: percentageData.map((quote) => quote.value),
				backgroundColor: pieChartColors,
			},
		],
	};

	return (
		<Card>
			<CardHeader className="flex items-center justify-between flex-row">
				<div className="flex flex-col gap-3">
					<CardTitle>Current Composition</CardTitle>
					<CardDescription>
						Last Updated:{" "}
						{format(portfolio?.updatedAt!, "dd MMM yyyy, hh:mm a")}
					</CardDescription>
				</div>

				<div className="flex items-center gap-5">
					<Dialog>
						<DialogTrigger asChild>
							<Button>Accept</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Accept Portfolio Optimization</DialogTitle>
							</DialogHeader>

							<AcceptOptimizationForm
								clientId={user.id}
								proposedPortfolioId={user.proposedPortfolioId as string}
								currentPortfolioId={user.currentPortfolioId as string}
							/>
						</DialogContent>
					</Dialog>
					<Link href={`/client/${user.id}/current-portfolio`}>
						<Button>View Detail</Button>
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				{quotes.length === 0 && <div>N/A</div>}
				{quotes.length > 0 && (
					<div className="flex justify-center max-w-[300px] mx-auto">
						<PieChart data={pieChartData} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
