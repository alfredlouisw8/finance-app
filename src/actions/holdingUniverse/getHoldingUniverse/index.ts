export default async function getHoldingUniverse(userId: string) {
	const response = await prisma.holdingUniverse.findMany({
		where: {
			userId,
		},
	});

	return response;
}
