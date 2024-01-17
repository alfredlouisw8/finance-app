import getUserDetail from "@/actions/users/getUserDetail";
import PieChart from "@/components/PieChart";
import RiskProfileSection from "@/components/RiskProfileSection";
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
import { User } from "@/types/User";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import Link from "next/link";

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

			<Card>
				{!user.riskProfile && (
					<div className="p-5 flex items-center justify-center h-40">
						<p>Risk profile not found</p>
					</div>
				)}
				{user.riskProfile && (
					<RiskProfileSection user={user} currentRole={session?.user.role} />
				)}
			</Card>
		</div>
	);
}
