"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { UpdatePortfolioCash } from "./schema";
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

	let portfolio;

	const { cash, portfolioId, clientId } = data;

	try {
		portfolio = await prisma.portfolio.update({
			where: {
				id: portfolioId,
			},
			data: {
				cash,
			},
		});
	} catch (error) {
		return {
			error: "Failed to update cash",
		};
	}

	revalidatePath(`/client/${clientId}/current-portfolio`);
	return { data: portfolio };
};

export const updatePortfolioCash = createSafeAction(
	UpdatePortfolioCash,
	handler
);
