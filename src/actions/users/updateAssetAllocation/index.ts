"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateAssetAllocation } from "./schema";
import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let user;

	const { equities, clientId } = data;

	try {
		user = await prisma.user.update({
			where: {
				id: clientId,
			},
			data: {
				equityAllocation: equities,
				fixedIncomeAllocation: 100 - equities,
			},
		});
	} catch (error) {
		return {
			error: "Failed to update asset allocation",
		};
	}

	revalidatePath(`/client/${clientId}`);
	return { data: user };
};

export const updateAssetAllocation = createSafeAction(
	UpdateAssetAllocation,
	handler
);
