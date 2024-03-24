"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DeleteHoldingUniverse } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let holdingUniverse;

	const { holdingUniverseId, userId } = data;

	try {
		holdingUniverse = await prisma.holdingUniverse.delete({
			where: {
				id: holdingUniverseId,
			},
		});
	} catch (error: any) {
		console.log(error);
		return {
			error: error.message || "Failed to delete holding universe.",
		};
	}

	revalidatePath(`/client/${userId}/current-portfolio`);
	return { data: holdingUniverse };
};

export const deleteHoldingUniverse = createSafeAction(
	DeleteHoldingUniverse,
	handler
);
