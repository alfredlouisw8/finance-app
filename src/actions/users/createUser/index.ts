"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUser } from "./schema";
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

	let result;

	const { email, name } = data;

	try {
		result = await prisma.$transaction(async (prisma) => {
			// Step 1: Create or update the user
			const user = await prisma.user.upsert({
				where: { email: email },
				update: { name: name, advisorId: session.user.id },
				create: { email: email, name: name, advisorId: session.user.id },
			});

			// Step 2: Create current and proposed portfolios
			const currentPortfolio = await prisma.portfolio.create({
				data: {
					// Portfolio data...
					userCurrent: { connect: { id: user.id } },
				},
			});

			const proposedPortfolio = await prisma.portfolio.create({
				data: {
					// Portfolio data...
					userProposed: { connect: { id: user.id } },
				},
			});

			// Step 3: Link portfolios back to the user
			// This step assumes you have the logic or fields to update the user with portfolio IDs
			// This might require adjusting your user model to directly store portfolio IDs or relations
			await prisma.user.update({
				where: { id: user.id },
				data: {
					currentPortfolioId: currentPortfolio.id,
					proposedPortfolioId: proposedPortfolio.id,
				},
			});

			return { user, currentPortfolio, proposedPortfolio };
		});
	} catch (error) {
		return {
			error: "Failed to create user.",
		};
	}

	revalidatePath(`/dashboard`);
	return { data: result.user };
};

export const createUser = createSafeAction(CreateUser, handler);
