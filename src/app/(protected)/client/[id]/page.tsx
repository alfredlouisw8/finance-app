import getUserDetail from "@/actions/users/getUserDetail";
import PieChart from "@/components/PieChart";
import RiskProfileSection from "@/app/(protected)/client/[id]/_components/RiskProfileSection";
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
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { authOptions } from "@/lib/auth";
import { Role } from "@/types/User";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import Link from "next/link";
import PortfolioSection from "./_components/PortfolioSection";
import CurrentCompositionSection from "./_components/CurrentCompositionSection";
import ProposedCompositionSection from "./_components/ProposedCompositionSection";

export default async function Page({ params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions);
	const user = await getUserDetail(params.id);

	if (!user) {
		return <p>User not found</p>;
	}

	return (
		<div className="flex flex-col gap-5">
			<Card>
				<CardHeader>
					<CardTitle>{user.name}</CardTitle>
					<CardDescription>{user.email}</CardDescription>
					<CardDescription>
						Member since {format(user.createdAt, "dd-MM-yyyy")}
					</CardDescription>
					<CardDescription>Risk Profile {user.riskProfile}</CardDescription>
				</CardHeader>
			</Card>

			{!user.riskProfile && (
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
			)}
			{user.riskProfile && (
				<RiskProfileSection
					user={user}
					currentRole={session?.user.role as Role}
				/>
			)}

			<PortfolioSection user={user} currentRole={session?.user.role as Role} />

			<div className="grid grid-cols-2 gap-5">
				<CurrentCompositionSection
					user={user}
					currentRole={session?.user.role as Role}
				/>
				<ProposedCompositionSection
					user={user}
					currentRole={session?.user.role as Role}
				/>
			</div>
		</div>
	);
}
