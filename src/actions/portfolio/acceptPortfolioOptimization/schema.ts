import { z } from "zod";

export const AcceptPortfolioOptimization = z.object({
	currentPortfolioId: z.string(),
	proposedPortfolioId: z.string(),
	clientId: z.string(),
});
