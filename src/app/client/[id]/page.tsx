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
import { getClient } from "@/lib/apollo-server";
import { User } from "@/types/User";
import { gql } from "@apollo/client";
import Link from "next/link";

const query = gql`
	query getUserById($id: String!) {
		getUserById(id: $id) {
			id
			name
			email
			riskProfile
			equityAllocation
			createdAt
		}
	}
`;

export default async function Page({ params }: { params: { id: string } }) {
	const client = getClient();
	const {
		data: { getUserById: user },
	} = await client.query<{ getUserById: Partial<User> }>({
		query,
		variables: {
			id: params.id,
		},
	});

	console.log(user);

	return (
		<div className="flex flex-col gap-5">
			<Card>
				<CardHeader>
					<CardTitle>{user.name}</CardTitle>
					<CardDescription>{user.email}</CardDescription>
					<CardDescription>Member since {user.createdAt}</CardDescription>
					<CardDescription>Risk Profile {user.riskProfile}</CardDescription>
				</CardHeader>
			</Card>

			<Card>
				{!user.riskProfile && (
					<div className="p-5 flex items-center justify-center h-40">
						<Link href={`/client/${params.id}/risk-profile-survey`}>
							<Button>Take Risk Profile Survey</Button>
						</Link>
					</div>
				)}
				{user.riskProfile && <RiskProfileSection user={user} />}
			</Card>
		</div>
	);
}
