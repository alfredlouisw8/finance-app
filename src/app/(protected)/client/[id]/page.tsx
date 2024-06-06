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
import getHoldingByPortfolio from "@/actions/holding/getHoldingByPortfolio";
import getPortfolio from "@/actions/portfolio/getPortfolio";
import { getHoldingsData } from "@/utils/functions";

export const maxDuration = 60;

export default async function Page({ params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions);
	const user = await getUserDetail(params.id);

	if (!user) {
		return <p>User not found</p>;
	}

	const currentHoldings = await getHoldingByPortfolio(
		user.currentPortfolioId as string
	);

	const proposedHoldings = await getHoldingByPortfolio(
		user.proposedPortfolioId as string
	);

	const currentPortfolio = await getPortfolio(
		user.currentPortfolioId as string
	);
	const proposedPortfolio = await getPortfolio(
		user.proposedPortfolioId as string
	);

	const currentHoldingsData = await getHoldingsData(currentHoldings);
	const proposedHoldingsData = await getHoldingsData(proposedHoldings);

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
				portfolio={currentPortfolio}
				holdingsData={currentHoldingsData}
			/>

			<div className="grid grid-cols-2 gap-5">
				<CurrentCompositionSection
					user={user}
					currentRole={session?.user.role as Role}
					portfolio={currentPortfolio}
					holdingsData={currentHoldingsData}
				/>
				<ProposedCompositionSection
					user={user}
					currentRole={session?.user.role as Role}
					portfolio={proposedPortfolio}
					holdingsData={proposedHoldingsData}
				/>
			</div>
		</div>
	);
}
