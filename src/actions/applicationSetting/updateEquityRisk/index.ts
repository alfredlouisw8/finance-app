"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UpdateEquityRisk } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (session && !session?.user?.isAdmin) {
		return {
			error: "Unauthorized",
		};
	}

	let equityRisk, riskFree;

	const { riskFreeRate, equityRiskPremium, clientId } = data;

	try {
		equityRisk = await prisma.applicationSetting.upsert({
			where: {
				name: "equityRiskPremium",
			},
			update: {
				value: equityRiskPremium + "",
			},
			create: {
				name: "equityRiskPremium",
				value: equityRiskPremium + "",
			},
		});

		riskFree = await prisma.applicationSetting.upsert({
			where: {
				name: "riskFreeRate",
			},
			update: {
				value: riskFreeRate + "",
			},
			create: {
				name: "riskFreeRate",
				value: riskFreeRate + "",
			},
		});
	} catch (error) {
		return {
			error: "Failed to update equity risk premium and risk free rate.",
		};
	}

	revalidatePath(`/client/${clientId}`);
	return { data: [equityRisk, riskFree] };
};

export const updateEquityRisk = createSafeAction(UpdateEquityRisk, handler);
