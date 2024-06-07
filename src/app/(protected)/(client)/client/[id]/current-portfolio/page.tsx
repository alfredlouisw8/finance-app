import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import getUserDetail from "@/actions/users/getUserDetail";
import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import {
	getAllDates,
	getDaysBetweenDates,
	getHoldingsData,
	getHoldingsPerformance,
	numberWithCommas,
} from "@/utils/functions";
import NewHoldingForm from "../_components/NewHoldingForm";
import PortfolioHoldingTable from "../_components/PortfolioHoldingTable";
import getPortfolio from "@/actions/portfolio/getPortfolio";
import PortfolioForm from "../_components/PortfolioForm";
import { format } from "date-fns";
import MixedLineChart from "@/components/MixedLineChart";
import BackButton from "@/components/BackButton";

export default async function Page({ params }: { params: { id: string } }) {
	const user = await getUserDetail(params.id);

	if (!user) {
		return <p>User not found</p>;
	}

	const holdings = await getHoldingByPortfolio(
		user.currentPortfolioId as string
	);
	const portfolio = await getPortfolio(user.currentPortfolioId as string);

	const quotes = await getHoldingsData(holdings);

	const currentTotalPortfolioValue = quotes.reduce(
		(acc, val) => acc + val.value,
		0
	);

	// Generate daily dates
	const startDate = portfolio?.updatedAt!;

	const endDate = new Date();
	const numOfDays = getDaysBetweenDates(startDate, endDate);

	const chartPerformances = await getHoldingsPerformance(holdings, startDate);

	// Replace with your actual daily prices
	const jksePrices = chartPerformances.indexIDPerformance;
	const spxPrices = chartPerformances.indexUSPerformance;
	const holdingsPrices = chartPerformances.portfolioPerformance;

	const data = {
		labels: chartPerformances.dateData,
		datasets: [
			{
				label: "^JKSE",
				data: jksePrices,
				borderColor: "blue",
				fill: false,
			},
			{
				label: "^SPX",
				data: spxPrices,
				borderColor: "red",
				fill: false,
			},
			{
				label: "Portfolio",
				data: holdingsPrices,
				borderColor: "orange",
				fill: false,
			},
		],
	};

	return (
		<>
			<BackButton />
			<div className="flex flex-col gap-5">
				<Card>
					<CardHeader className="flex flex-row justify-between items-center">
						<div className="flex flex-col">
							<CardTitle>Current Portfolio Composition</CardTitle>
							<CardDescription>
								Last Updated:{" "}
								{format(portfolio?.updatedAt!, "dd MMM yyyy, hh:mm a")}
							</CardDescription>
						</div>

						<div className="flex items-center gap-5">
							<Dialog>
								<DialogTrigger asChild>
									<Button>Update Cash</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Update Portfolio Cash</DialogTitle>
									</DialogHeader>

									<PortfolioForm
										portfolioId={portfolio?.id as string}
										cash={portfolio?.cash as number}
										clientId={params.id}
									/>
								</DialogContent>
							</Dialog>
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
						</div>
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
							portfolioId={user.currentPortfolioId as string}
						/>
					</CardContent>
				</Card>

				<MixedLineChart data={data} numOfDays={numOfDays} />
			</div>
		</>
	);
}
