import { z } from "zod";

export const OptimizePortfolio = z.object({
	optimizedWeightJson: z.string(),
	currentPortfolioId: z.string(),
	proposedPortfolioId: z.string(),
	clientId: z.string(),
});
