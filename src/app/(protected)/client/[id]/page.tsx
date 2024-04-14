import getUserDetail from "@/actions/users/getUserDetail";

import RiskProfileSection from "@/app/(protected)/client/[id]/_sections/RiskProfileSection";

import { authOptions } from "@/lib/auth";
import { Role } from "@/types/User";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import Link from "next/link";
import PortfolioSection from "./_sections/PortfolioSection";
import CurrentCompositionSection from "./_sections/CurrentCompositionSection";
import ProposedCompositionSection from "./_sections/ProposedCompositionSection";
import UserProfileSection from "./_sections/UserProfileSection";

export default async function Page({ params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions);
	const user = await getUserDetail(params.id);

	if (!user) {
		return <p>User not found</p>;
	}

	return (
		<div className="flex flex-col gap-5">
			<UserProfileSection user={user} />

			<RiskProfileSection
				user={user}
				currentRole={session?.user.role as Role}
			/>

			<PortfolioSection
				user={user}
				currentRole={session?.user.role as Role}
				isAdmin={session?.user.isAdmin as boolean}
			/>

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
