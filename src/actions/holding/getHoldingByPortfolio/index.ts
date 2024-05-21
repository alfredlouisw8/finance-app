import prisma from "@/lib/prisma";

export default async function getHoldingByPortfolio(id: string) {
	const response = await prisma.holding.findMany({
		where: {
			portfolioId: id,
		},
	});

	return response;
}
