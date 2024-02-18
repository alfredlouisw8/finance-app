import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/types/User";
import { User } from "@prisma/client";

type Props = {
	user: User;
	currentRole: Role;
};

export default function ProposedCompositionSection({
	user,
	currentRole,
}: Props) {
	return (
		<Card>
			<CardHeader className="flex items-center justify-between flex-row">
				<CardTitle>Proposed Composition</CardTitle>

				{currentRole === Role.ADVISOR && <Button>Edit Composition</Button>}
			</CardHeader>
			<CardContent>asd</CardContent>
		</Card>
	);
}
