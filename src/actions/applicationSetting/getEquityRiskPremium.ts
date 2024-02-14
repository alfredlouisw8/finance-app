export default async function getEquityRiskPremium() {
	const response = await prisma.applicationSetting.findUnique({
		where: {
			name: "equityRiskPremium",
		},
	});

	return response;
}
