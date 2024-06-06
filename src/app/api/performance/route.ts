import { getHoldingsPerformance } from "@/utils/functions";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
	const { portfolioId, startDate } = await request.json();

	const holdings = await prisma.holding.findMany({
		where: {
			portfolioId,
		},
	});

	const performances = await getHoldingsPerformance(holdings, startDate);

	return Response.json(performances);
}
