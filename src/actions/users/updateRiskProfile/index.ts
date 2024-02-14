"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateRiskProfile } from "./schema";
import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRiskProfileResult } from "@/utils/functions";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let user;

	const {
		question2,
		question3,
		question4,
		question5,
		question6,
		question7,
		clientId,
	} = data;

	const totalPoints =
		parseInt(question2) +
		parseInt(question3) +
		parseInt(question4) +
		parseInt(question5) +
		parseInt(question6) +
		parseInt(question7);

	const riskProfile = getRiskProfileResult(totalPoints);

	try {
		user = await prisma.user.update({
			where: {
				id: clientId,
			},
			data: {
				riskProfile: riskProfile,
			},
		});
	} catch (error) {
		return {
			error: "Failed to create risk profile.",
		};
	}

	revalidatePath(`/client/${clientId}`);
	return { data: user };
};

export const updateRiskProfile = createSafeAction(UpdateRiskProfile, handler);
