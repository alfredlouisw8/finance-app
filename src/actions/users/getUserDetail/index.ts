import { authOptions } from "@/lib/auth";
import { PortfolioType, User } from "@prisma/client";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { UserDetail } from "@/types/User";

export default async function getUserDetail(
	id: string
): Promise<Partial<UserDetail>> {
	const session = await getServerSession(authOptions);

	const response = await prisma.user.findUnique({
		where: {
			id: id,
		},
	});

	const currentPortfolioId = await prisma.userPortfolio.findFirst({
		where: {
			userId: id,
			type: PortfolioType.CURRENT,
		},
		select: {
			portfolioId: true,
		},
	});

	const proposedPortfolioId = await prisma.userPortfolio.findFirst({
		where: {
			userId: id,
			type: PortfolioType.PROPOSED,
		},
		select: {
			portfolioId: true,
		},
	});

	return {
		...response,
		currentPortfolioId: currentPortfolioId?.portfolioId,
		proposedPortfolioId: proposedPortfolioId?.portfolioId,
	};
}
