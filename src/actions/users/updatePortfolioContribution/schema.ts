import { z } from "zod";

export const UpdatePortfolioContribution = z.object({
	portfolioContribution: z.number(),
	equityRiskPremium: z.string(),
	clientId: z.string(),
});
