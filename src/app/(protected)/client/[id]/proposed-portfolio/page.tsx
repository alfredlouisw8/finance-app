import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import HoldingForm from "../_components/HoldingForm";
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
import {
	calculatePerformance,
	getHoldingsData,
	getTotalValue,
	numberWithCommas,
} from "@/utils/functions";
import { Pencil, Trash2 } from "lucide-react";
import NewHoldingForm from "../_components/NewHoldingForm";
import EditHoldingForm from "../_components/EditHoldingForm";
import DeleteHoldingForm from "../_components/DeleteHoldingForm";
import PortfolioHoldingTable from "../_components/PortfolioHoldingTable";
import getPortfolio from "@/actions/portfolio/getPortfolio";

export default async function Page({ params }: { params: { id: string } }) {
	const user = await getUserDetail(params.id);

	if (!user) {
		return <p>User not found</p>;
	}

	const holdings = await getHoldingByPortfolio(
		user.proposedPortfolioId as string
	);
	const portfolio = await getPortfolio(user.proposedPortfolioId as string);

	const quotes = await getHoldingsData(holdings);

	const currentTotalPortfolioValue = quotes.reduce(
		(acc, val) => acc + val.value,
		0
	);

	return (
		<Card>
			<CardHeader className="flex flex-row justify-between items-center">
				<div className="flex flex-col">
					<CardTitle>Proposed Portfolio Composition</CardTitle>
					<CardDescription>Cash: IDR {portfolio?.cash}</CardDescription>
				</div>

				<Dialog>
					<DialogTrigger asChild>
						<Button>Create Holding</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>New Holding</DialogTitle>
						</DialogHeader>

						<NewHoldingForm
							portfolioId={user.proposedPortfolioId as string}
							userId={params.id}
						/>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				<p>Cash: IDR {numberWithCommas(portfolio?.cash as number)}</p>
				<p>
					Current Portfolio Value: IDR{" "}
					{numberWithCommas(currentTotalPortfolioValue)}
				</p>
				<PortfolioHoldingTable
					holdingsData={quotes}
					userId={params.id}
					portfolioId={user.proposedPortfolioId as string}
				/>
			</CardContent>
		</Card>
	);
}
