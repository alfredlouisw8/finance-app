"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { UpdatePortfolioContribution } from "./schema";
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

	const { portfolioContribution, equityRiskPremium, clientId, riskFreeRate } =
		data;

	try {
		user = await prisma.user.update({
			where: {
				id: clientId,
			},
			data: {
				portfolioContribution: portfolioContribution,
			},
		});

		await prisma.applicationSetting.upsert({
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

		await prisma.applicationSetting.upsert({
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
			error: "Failed to update portfolio contribution",
		};
	}

	revalidatePath(`/client/${clientId}`);
	return { data: user };
};

export const updatePortfolioContribution = createSafeAction(
	UpdatePortfolioContribution,
	handler
);
