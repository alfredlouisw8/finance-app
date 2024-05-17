import { getHoldingsPerformance } from "@/utils/functions";

export async function POST(request: Request) {
	const { holdings, startDate } = await request.json();

	const performances = await getHoldingsPerformance(holdings, startDate);

	return Response.json(performances);
}
