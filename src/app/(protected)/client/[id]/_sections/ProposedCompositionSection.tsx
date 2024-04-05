import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import PieChart from "@/components/PieChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Role } from "@/types/User";
import { pieChartColors } from "@/utils/consts";
import { getHoldingsData, getTotalValue } from "@/utils/functions";
import { User } from "@prisma/client";
import Link from "next/link";
import yahooFinance from "yahoo-finance2";
import OptimizePortfolioForm from "../_components/OptimizePortfolioForm";
import getHoldingUniverse from "@/actions/holdingUniverse/getHoldingUniverse";
import getRiskFreeRate from "@/actions/applicationSetting/getRiskFreeRate";

type Props = {
	user: User;
	currentRole: Role;
};

export default async function ProposedCompositionSection({
	user,
	currentRole,
}: Props) {
	const holdings = await getHoldingByPortfolio(
		user.proposedPortfolioId as string
	);

	const quotes = await getHoldingsData(holdings);

	const pieChartData = {
		labels: quotes.map((quote) => quote.ticker),
		datasets: [
			{
				label: "percentage",
				data: quotes.map((quote) => quote.value),
				backgroundColor: pieChartColors,
			},
		],
	};

	const holdingUniverse = await getHoldingUniverse(user.id);
	const riskFreeRate = await getRiskFreeRate();

	return (
		<Card>
			<CardHeader className="flex items-center justify-between flex-row">
				<CardTitle>Proposed Composition</CardTitle>

				<div className="flex items-center gap-5">
					{currentRole === Role.ADVISOR && (
						<div className="flex items-center gap-5">
							<Dialog>
								<DialogTrigger asChild>
									<Button>Optimize</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Portfolio Contribution</DialogTitle>
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
				{quotes.length === 0 && <div>N/A</div>}
				{quotes.length > 0 && (
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
