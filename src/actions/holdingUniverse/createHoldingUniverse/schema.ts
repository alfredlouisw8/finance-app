import { HoldingType } from "@prisma/client";
import { z } from "zod";

export const CreateHoldingUniverse = z.object({
	ticker: z.string().min(1, "Required"),
	userId: z.string(),
});
