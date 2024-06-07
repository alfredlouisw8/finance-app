import { z } from "zod";

export const CreateUser = z.object({
	email: z.string().email().min(1, {
		message: "Must be at least 1 characters.",
	}),
	name: z.string().min(1, {
		message: "Must be at least 1 characters.",
	}),
	address: z.string().min(1, {
		message: "Must be at least 1 characters.",
	}),
	phone: z.string().min(1, {
		message: "Must be at least 1 characters.",
	}),
});
