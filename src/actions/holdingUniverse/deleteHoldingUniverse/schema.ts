import { z } from "zod";

export const DeleteHoldingUniverse = z.object({
	holdingUniverseIds: z.string().array(),
	userId: z.string(),
});
