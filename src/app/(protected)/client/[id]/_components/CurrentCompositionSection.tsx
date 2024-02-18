import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/types/User";
import { User } from "@prisma/client";
import Link from "next/link";

type Props = {
	user: User;
	currentRole: Role;
};

export default function CurrentCompositionSection({
	user,
	currentRole,
}: Props) {
	return (
		<Card>
			<CardHeader className="flex items-center justify-between flex-row">
				<CardTitle>Current Composition</CardTitle>

				<Link href={`/client/${user.id}/current-portfolio`}>
					<Button>View Detail</Button>
				</Link>
			</CardHeader>
			<CardContent>{!user.currentPortfolioId && <div>N/A</div>}</CardContent>
		</Card>
	);
}
