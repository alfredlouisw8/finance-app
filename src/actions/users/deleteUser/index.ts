"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { InputType, ReturnType } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DeleteUser } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
	const session = await getServerSession(authOptions);

	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	let user;

	const { userId } = data;

	try {
		const user = await prisma.$transaction(async (prisma) => {
			// Check if logged-in user is the advisor of the deleted user
			const userToDelete = await prisma.user.findUnique({
				where: { id: userId },
				include: {
					holdingUniverse: true,
					userPortfolio: {
						include: {
							portfolio: {
								include: {
									holdings: true,
								},
							},
						},
					},
					sessions: true,
					accounts: true,
				},
			});

			if (!userToDelete) {
				throw new Error("User not found");
			}

			if (userToDelete.advisorId !== session.user.id) {
				throw new Error("Unauthorized");
			}

			// Delete related HoldingUniverses
			await prisma.holdingUniverse.deleteMany({
				where: { userId },
			});

			// Delete related UserPortfolios
			await prisma.userPortfolio.deleteMany({
				where: { userId },
			});

			// Delete related Holdings and Portfolios
			for (const userPortfolio of userToDelete.userPortfolio) {
				await prisma.holding.deleteMany({
					where: { portfolioId: userPortfolio.portfolioId },
				});

				await prisma.portfolio.delete({
					where: { id: userPortfolio.portfolioId },
				});
			}

			// Delete related Sessions
			await prisma.session.deleteMany({
				where: { userId },
			});

			// Delete related Accounts
			await prisma.account.deleteMany({
				where: { userId },
			});

			// Delete related Clients
			await prisma.client.deleteMany({
				where: {
					email: userToDelete.email!,
				},
			});

			// Finally, delete the User
			return await prisma.user.delete({
				where: { id: userId },
			});
		});
	} catch (error: any) {
		console.log(error);
		return {
			error: error.message || "Failed to delete user.",
		};
	}

	revalidatePath(`/dashboard`);
	return { data: user };
};

export const deleteUser = createSafeAction(DeleteUser, handler);
