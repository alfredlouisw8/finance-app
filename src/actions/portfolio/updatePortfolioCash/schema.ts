import { z } from "zod";

export const UpdatePortfolioCash = z.object({
	cash: z.number(),
	portfolioId: z.string(),
	clientId: z.string(),
});
