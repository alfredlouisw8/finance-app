import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
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
	getHoldingsData,
	getTotalValue,
} from "@/utils/functions";
import { Portfolio, User } from "@prisma/client";
import Link from "next/link";
import OptimizePortfolioForm from "../_components/OptimizePortfolioForm";
import getHoldingUniverse from "@/actions/holdingUniverse/getHoldingUniverse";
import getRiskFreeRate from "@/actions/applicationSetting/getRiskFreeRate";
import getPortfolio from "@/actions/portfolio/getPortfolio";
import { format } from "date-fns";
import { HoldingData } from "@/types/Holding";

type Props = {
	user: User;
	currentRole: Role;
	portfolio: Portfolio | null;
	holdingsData: HoldingData[];
};

export default async function ProposedCompositionSection({
	user,
	currentRole,
	portfolio,
	holdingsData,
}: Props) {
	const currentTotalPortfolioValue =
		holdingsData.reduce((acc, val) => acc + val.value, 0) + portfolio?.cash!;

	const percentageData = [
		...holdingsData.map((quote) => ({
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

	const holdingUniverse = await getHoldingUniverse(user.id);
	const riskFreeRate = await getRiskFreeRate();

	return (
		<Card>
			<CardHeader className="flex items-center justify-between flex-row">
				<div className="flex flex-col gap-3">
					<CardTitle>Proposed Composition</CardTitle>
					<CardDescription>
						Last Updated:{" "}
						{format(portfolio?.updatedAt!, "dd MMM yyyy, hh:mm a")}
					</CardDescription>
				</div>

				<div className="flex items-center gap-5">
					{currentRole === Role.ADVISOR && (
						<div className="flex items-center gap-5">
							<Dialog>
								<DialogTrigger asChild>
									<Button>Optimize</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Optimize Portfolio</DialogTitle>
									</DialogHeader>

									<OptimizePortfolioForm
										user={user}
										holdingUniverse={holdingUniverse}
										riskFreeRate={riskFreeRate?.value as string}
									/>
								</DialogContent>
							</Dialog>
						</div>
					)}
					<Link href={`/client/${user.id}/proposed-portfolio`}>
						<Button>View Detail</Button>
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				{holdingsData.length === 0 && <div>N/A</div>}
				{holdingsData.length > 0 && (
					<>
						<div className="flex justify-center max-w-[300px] mx-auto">
							<PieChart data={pieChartData} />
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
