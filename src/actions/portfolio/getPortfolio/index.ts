export default async function getPortfolio(portfolioId: string) {
	const response = await prisma.portfolio.findUnique({
		where: {
			id: portfolioId,
		},
	});

	return response;
}
