export default async function getRiskFreeRate() {
	const response = await prisma.applicationSetting.findUnique({
		where: {
			name: "riskFreeRate",
		},
	});

	return response;
}
