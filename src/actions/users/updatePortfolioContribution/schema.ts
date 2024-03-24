import { z } from "zod";

export const UpdatePortfolioContribution = z.object({
	portfolioContribution: z.number(),
	equityRiskPremium: z.string(),
	riskFreeRate: z.string(),
	clientId: z.string(),
});
