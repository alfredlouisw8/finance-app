import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../../../../../components/ui/button";
import Link from "next/link";
import PieChart from "../../../../../components/PieChart";

import { Role, UserDetail } from "@/types/User";
import { User } from "@prisma/client";
import AssetAllocationForm from "../_components/AssetAllocationForm";
import { pieChartColors } from "@/utils/consts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BenchmarkReturnTable from "../_components/BenchmarkReturnTable";

type Props = {
	user: Partial<UserDetail>;
	currentRole: Role;
};

export default async function RiskProfileSection({ user, currentRole }: Props) {
	const session = await getServerSession(authOptions);

	if (!user.riskProfile) {
		return (
			<Card>
				<div className="p-5 flex flex-col items-center justify-center h-40 gap-3">
					<p>Risk profile not found</p>

					{session?.user.role === Role.ADVISOR && (
						<Link href={`/client/${user.id}/risk-profile-survey`}>
							<Button>Take Risk Profile Survey</Button>
						</Link>
					)}
				</div>
			</Card>
		);
	}

	const equities = user.equityAllocation || 50;
	const fixedIncome = 100 - equities;

	const pieChartData = {
		labels: ["Risky Asset ", "Fixed Income "],
		datasets: [
			{
				label: "percentage",
				data: [equities, fixedIncome],
				backgroundColor: pieChartColors,
			},
		],
	};

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between">
				<CardTitle>Risk Profile: {user.riskProfile}</CardTitle>
				<div className="flex items-center gap-5">
					{currentRole === Role.ADVISOR && (
						<>
							<Link href={`/client/${user.id}/risk-profile-survey`}>
								<Button>Take Risk Profile Survey</Button>
							</Link>

							<Dialog>
								<DialogTrigger asChild>
									<Button>Edit Asset Allocation</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Asset Allocation</DialogTitle>
									</DialogHeader>

									<AssetAllocationForm
										equities={equities}
										clientId={user.id as string}
									/>
								</DialogContent>
							</Dialog>
						</>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex justify-around mx-auto">
					<div className="flex justify-center max-w-[300px]">
						<PieChart data={pieChartData} />
					</div>

					<div className="flex justify-center">
						<BenchmarkReturnTable
							equities={equities}
							fixedIncome={fixedIncome}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
