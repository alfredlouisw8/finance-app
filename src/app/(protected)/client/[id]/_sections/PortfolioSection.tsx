import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Role } from "@/types/User";
import { Portfolio, User } from "@prisma/client";
import PortfolioForm from "../_components/PortfolioForm";
import getEquityRiskPremium from "@/actions/applicationSetting/getEquityRiskPremium";
import {
	calculatePerformance,
	getHoldingsData,
	getPortfolioBetaValue,
	numberWithCommas,
} from "@/utils/functions";
import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import getRiskFreeRate from "@/actions/applicationSetting/getRiskFreeRate";
import Link from "next/link";
import EquityRiskForm from "../_components/EquityRiskForm";
import getPortfolio from "@/actions/portfolio/getPortfolio";
import { HoldingData } from "@/types/Holding";

type Props = {
	user: User;
	currentRole: Role;
	isAdmin: boolean;
	portfolio: Portfolio | null;
	holdingsData: HoldingData[];
};

export default async function PortfolioSection({
	user,
	currentRole,
	isAdmin,
	holdingsData,
	portfolio,
}: Props) {
	const equityRiskPremium = await getEquityRiskPremium();
	const riskFreeRate = await getRiskFreeRate();

	const initialTotalPortfolioValue =
		holdingsData.reduce((acc, val) => acc + val.initialValue, 0) +
		portfolio?.cash!;

	const currentTotalPortfolioValue =
		holdingsData.reduce((acc, val) => acc + val.value, 0) + portfolio?.cash!;

	const portfolioBeta = await getPortfolioBetaValue(
		holdingsData,
		currentTotalPortfolioValue
	);

	const expectedReturn =
		parseFloat(riskFreeRate?.value!) +
		portfolioBeta * parseFloat(equityRiskPremium?.value!);

	return (
		<Card>
			<CardHeader className="flex items-center justify-between flex-row">
				<CardTitle>Portfolio</CardTitle>

				{currentRole === Role.ADVISOR && (
					<div className="flex items-center gap-5">
						{isAdmin && (
							<Dialog>
								<DialogTrigger asChild>
									<Button>Edit Equity Risk</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Equity Risk</DialogTitle>
									</DialogHeader>

									<EquityRiskForm
										user={user}
										equityRiskPremium={equityRiskPremium?.value}
										riskFreeRate={riskFreeRate?.value}
									/>
								</DialogContent>
							</Dialog>
						)}

						<Link href={`/client/${user.id}/holding-universe`}>
							<Button>Edit Universe</Button>
						</Link>
					</div>
				)}
			</CardHeader>
			<CardContent>
				<div className="flex items-center max-w-4xl mx-auto">
					<Table>
						<TableHeader className="bg-slate-200">
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead className="text-right">Value</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell>Contribution</TableCell>
								<TableCell className="text-right">
									{numberWithCommas(initialTotalPortfolioValue) || "-"}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Current Value</TableCell>
								<TableCell className="text-right">
									{numberWithCommas(currentTotalPortfolioValue) || "-"}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Return</TableCell>
								<TableCell className="text-right">
									{calculatePerformance(
										initialTotalPortfolioValue,
										currentTotalPortfolioValue
									)}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Price Return</TableCell>
								<TableCell className="text-right">
									{numberWithCommas(
										Math.round(currentTotalPortfolioValue) -
											initialTotalPortfolioValue
									)}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Expected Return</TableCell>
								<TableCell className="text-right">
									{riskFreeRate?.value &&
									equityRiskPremium?.value &&
									expectedReturn
										? expectedReturn.toFixed(2) + "%"
										: "-"}
									{}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Risk Free Rate</TableCell>
								<TableCell className="text-right">
									{riskFreeRate?.value + "%" || "-"}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Beta</TableCell>
								<TableCell className="text-right">
									{portfolioBeta ? portfolioBeta.toFixed(2) : "-"}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Equity Risk Premium</TableCell>
								<TableCell className="text-right">
									{equityRiskPremium?.value + "%" || "-"}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
