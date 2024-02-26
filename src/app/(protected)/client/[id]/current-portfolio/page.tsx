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
import { HoldingType, User } from "@prisma/client";
import { Role } from "@/types/User";
import getUserDetail from "@/actions/users/getUserDetail";
import yahooFinance from "yahoo-finance2";
import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import { numberWithCommas } from "@/utils/functions";
import { Pencil, Trash2 } from "lucide-react";
import NewHoldingForm from "./_components/NewHoldingForm";
import EditHoldingForm from "./_components/EditHoldingForm";

export default async function Page({ params }: { params: { id: string } }) {
	const user = await getUserDetail(params.id);

	if (!user) {
		return <p>User not found</p>;
	}

	const holdings = await getHoldingByPortfolio(
		user.currentPortfolioId as string
	);

	const quotes = await Promise.all(
		holdings.map(async (holding) => {
			const result = await yahooFinance.quoteSummary(holding.ticker, {
				modules: ["price"],
			});
			return {
				name: result.price?.longName,
				price: result.price?.regularMarketPrice,
			};
		})
	);

	const USDIDR = await yahooFinance.quote("IDR=X");

	function calculatePerformance(startPrice: number, endPrice: number) {
		if (!endPrice || !startPrice) {
			return "N/A";
		}

		return ((endPrice / startPrice - 1) * 100).toFixed(2) + "%";
	}

	function getTotalValue(
		lastPrice: number | undefined,
		amount: number,
		type: HoldingType
	) {
		if (!lastPrice) {
			return "N/A";
		}
		let totalValue;
		totalValue = lastPrice * amount;

		if (type === HoldingType.US_STOCK) {
			totalValue = lastPrice * amount * USDIDR.regularMarketPrice!;
		}

		return `IDR ${numberWithCommas(parseInt(totalValue.toFixed(2)))}`;
	}

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
							<DialogTitle>New Holding</DialogTitle>
						</DialogHeader>

						<NewHoldingForm
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
							<TableHead>Type</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Avg Buy Price</TableHead>
							<TableHead>Last Price</TableHead>
							<TableHead>Total</TableHead>
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
										<TableCell>{quotes[i].name}</TableCell>
										<TableCell>{data.type}</TableCell>
										<TableCell>{data.ticker}</TableCell>
										<TableCell>{data.amount}</TableCell>
										<TableCell>{data.averageBuyPrice}</TableCell>
										<TableCell>{quotes[i].price}</TableCell>
										<TableCell>
											{getTotalValue(quotes[i].price, data.amount, data.type)}
										</TableCell>
										<TableCell>
											{calculatePerformance(
												data.averageBuyPrice,
												quotes[i].price as number
											)}
										</TableCell>
										<TableCell className="text-right flex items-center justify-end gap-3">
											<Dialog>
												<DialogTrigger asChild>
													<Button>
														<Pencil size={20} />
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Edit Holding</DialogTitle>
													</DialogHeader>

													<EditHoldingForm
														portfolioId={user.currentPortfolioId as string}
														userId={params.id}
														holding={data}
													/>
												</DialogContent>
											</Dialog>

											<Button variant="destructive">
												<Link href={`/client/${data.id}`}>
													<Trash2 size={20} />
												</Link>
											</Button>
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
