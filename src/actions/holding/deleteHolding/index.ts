"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DeleteHolding } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let portfolio, holding;

	const { holdingId, portfolioId, userId } = data;

	try {
		[holding, portfolio] = await prisma.$transaction([
			prisma.holding.delete({
				where: {
					id: holdingId,
				},
			}),

			prisma.portfolio.update({
				where: {
					id: portfolioId,
				},
				data: {
					updatedAt: new Date(),
				},
			}),
		]);
	} catch (error: any) {
		console.log(error);
		return {
			error: error.message || "Failed to delete holding.",
		};
	}

	revalidatePath(`/client/${userId}/current-portfolio`);
	return { data: holding };
};

export const deleteHolding = createSafeAction(DeleteHolding, handler);
