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
import { User } from "@prisma/client";
import PortfolioForm from "../_components/PortfolioForm";
import getEquityRiskPremium from "@/actions/applicationSetting/getEquityRiskPremium";
import { numberWithCommas } from "@/utils/functions";

type Props = {
	user: User;
	currentRole: Role;
};

export default async function PortfolioSection({ user, currentRole }: Props) {
	const equityRiskPremium = await getEquityRiskPremium();

	return (
		<Card>
			<CardHeader className="flex items-center justify-between flex-row">
				<CardTitle>Portfolio</CardTitle>

				{currentRole === Role.ADVISOR && (
					<Dialog>
						<DialogTrigger asChild>
							<Button>Edit Portfolio</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Portfolio Contribution</DialogTitle>
							</DialogHeader>

							<PortfolioForm
								user={user}
								equityRiskPremium={equityRiskPremium?.value}
							/>
						</DialogContent>
					</Dialog>
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
									{numberWithCommas(user.portfolioContribution) || "-"}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Return</TableCell>
								<TableCell className="text-right">-</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Price Return</TableCell>
								<TableCell className="text-right">-</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Expected Return</TableCell>
								<TableCell className="text-right">-</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Risk Free Rate</TableCell>
								<TableCell className="text-right">-</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Beta</TableCell>
								<TableCell className="text-right">-</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Equity Risk Premium</TableCell>
								<TableCell className="text-right">
									{equityRiskPremium?.value || "-"}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
