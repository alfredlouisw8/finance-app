import { z } from "zod";

export const DeleteHoldingUniverse = z.object({
	holdingUniverseId: z.string(),
	userId: z.string(),
});
