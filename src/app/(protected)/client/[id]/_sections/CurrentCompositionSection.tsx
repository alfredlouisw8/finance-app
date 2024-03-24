import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import PieChart from "@/components/PieChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/types/User";
import { pieChartColors } from "@/utils/consts";
import { getHoldingsData, getTotalValue } from "@/utils/functions";
import { User } from "@prisma/client";
import Link from "next/link";
import yahooFinance from "yahoo-finance2";

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

	return (
		<Card>
			<CardHeader className="flex items-center justify-between flex-row">
				<CardTitle>Current Composition</CardTitle>

				<Link href={`/client/${user.id}/current-portfolio`}>
					<Button>View Detail</Button>
				</Link>
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
