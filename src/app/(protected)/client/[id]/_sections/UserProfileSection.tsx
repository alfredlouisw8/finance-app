import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { UserDetail } from "@/types/User";
import { User } from "@prisma/client";
import { format } from "date-fns";

type Props = {
	user: Partial<UserDetail>;
};

export default function UserProfileSection({ user }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{user.name}</CardTitle>
				<CardDescription>{user.email}</CardDescription>
				<CardDescription>
					Member since {format(user.createdAt!, "dd-MM-yyyy")}
				</CardDescription>
				<CardDescription>Risk Profile {user.riskProfile}</CardDescription>
			</CardHeader>
		</Card>
	);
}
