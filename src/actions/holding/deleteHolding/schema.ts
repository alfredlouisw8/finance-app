import { z } from "zod";

export const DeleteHolding = z.object({
	holdingId: z.string(),
	portfolioId: z.string(),
	userId: z.string(),
});
