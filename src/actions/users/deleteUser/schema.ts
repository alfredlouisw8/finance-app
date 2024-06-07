import { z } from "zod";

export const DeleteUser = z.object({
	userId: z.string(),
});
