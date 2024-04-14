import { z } from "zod";

export const UpdateEquityRisk = z.object({
	equityRiskPremium: z.string(),
	riskFreeRate: z.string(),
	clientId: z.string(),
});
