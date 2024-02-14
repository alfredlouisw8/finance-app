import { z } from "zod";

export const UpdateAssetAllocation = z.object({
	equities: z.number(),
	clientId: z.string(),
});
