import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HoldingForm from "./_components/HoldingForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@prisma/client";
import { Role } from "@/types/User";
import getUserDetail from "@/actions/users/getUserDetail";
import yahooFinance from "yahoo-finance2";
import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";

export default async function Page({ params }: { params: { id: string } }) {
	const user = await getUserDetail(params.id);

	if (!user) {
		return <p>User not found</p>;
	}

	const holdings = await getHoldingByPortfolio(
		user.currentPortfolioId as string
	);

	const quotes = await yahooFinance.quote(
		holdings.map((item) => item.ticker),
		{ fields: ["displayName", "regularMarketPrice"] }
	);

	function calculatePerformance(startPrice: number, endPrice: number) {
		if (!endPrice || !startPrice) {
			return "N/A";
		}

		return ((endPrice / startPrice - 1) * 100).toFixed(2) + "%";
	}

	console.log(quotes);

	return (
		<Card>
			<CardHeader className="flex flex-row justify-between items-center">
				<CardTitle>Current Portfolio Composition</CardTitle>

				<Dialog>
					<DialogTrigger asChild>
						<Button>Create Holding</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Holding</DialogTitle>
						</DialogHeader>

						<HoldingForm
							portfolioId={user.currentPortfolioId as string}
							userId={params.id}
						/>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">No</TableHead>
							<TableHead>Investment Product Name</TableHead>
							<TableHead>Ticker</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Avg Buy Price</TableHead>
							<TableHead>Last Price</TableHead>
							<TableHead>Performance</TableHead>
							<TableHead className="text-right">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{holdings.length > 0 ? (
							holdings.map((data, i) => {
								return (
									<TableRow key={data.id}>
										<TableCell className="font-medium">{i + 1}</TableCell>
										<TableCell>{quotes[i].displayName}</TableCell>
										<TableCell>{data.ticker}</TableCell>
										<TableCell>{data.amount}</TableCell>
										<TableCell>{data.averageBuyPrice}</TableCell>
										<TableCell>{quotes[i].regularMarketPrice}</TableCell>
										<TableCell>
											{calculatePerformance(
												data.averageBuyPrice,
												quotes[i].regularMarketPrice as number
											)}
										</TableCell>
										<TableCell className="text-right flex items-center justify-end">
											{/* <Link href={`/client/${data.id}`}>
												<Eye />
											</Link> */}
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									No data to display
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
