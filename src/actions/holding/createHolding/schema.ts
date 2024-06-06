import { HoldingType } from "@prisma/client";
import { z } from "zod";

export const CreateHolding = z.object({
	portfolioId: z.string(),
	ticker: z.string().min(1, "Required"),
	averageBuyPrice: z.number(),
	amount: z.number(),
	userId: z.string(),
	holdingId: z.string().optional(),
});
