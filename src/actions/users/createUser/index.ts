"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUser } from "./schema";
import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PortfolioType } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let result;

	const { email, name, address, phone } = data;

	try {
		result = await prisma.$transaction(async (prisma) => {
			// Step 1: Create or update the user
			const user = await prisma.user.upsert({
				where: { email: email },
				update: {
					name: name,
					advisorId: session.user.id,
					address: address,
					phone: phone,
				},
				create: {
					email: email,
					name: name,
					advisorId: session.user.id,
					address: address,
					phone: phone,
				},
			});

			// Step 2: Create the current portfolio
			const currentPortfolio = await prisma.portfolio.create({
				data: {
					// Portfolio data...
					cash: 0, // default cash value or your logic to set cash
					holdings: {}, // default holdings or your logic to set holdings
				},
			});

			// Step 3: Create the proposed portfolio
			const proposedPortfolio = await prisma.portfolio.create({
				data: {
					// Portfolio data...
					cash: 0, // default cash value or your logic to set cash
					holdings: {}, // default holdings or your logic to set holdings
				},
			});

			// Step 4: Link portfolios to the user via UserPortfolio
			await prisma.userPortfolio.createMany({
				data: [
					{
						userId: user.id,
						portfolioId: currentPortfolio.id,
						type: PortfolioType.CURRENT,
					},
					{
						userId: user.id,
						portfolioId: proposedPortfolio.id,
						type: PortfolioType.PROPOSED,
					},
				],
			});

			//step 5: create client
			await prisma.client.create({
				data: {
					email: email,
				},
			});

			return { user, currentPortfolio, proposedPortfolio };
		});
	} catch (error: any) {
		console.error(error.message);
		return {
			error: error.message || "Failed to create user.",
		};
	}

	revalidatePath(`/dashboard`);
	return { data: result.user };
};

export const createUser = createSafeAction(CreateUser, handler);
