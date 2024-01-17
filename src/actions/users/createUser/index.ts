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

	let user;

	const { email, name } = data;

	try {
		await prisma.$transaction([
			prisma.user.upsert({
				where: {
					email: email,
				},
				update: {
					name: name,
					advisorId: session.user.id,
				},
				create: {
					email: email,
					name: name,
					advisorId: session.user.id,
				},
			}),
			prisma.client.create({
				data: {
					email: email,
				},
			}),
		]);
	} catch (error) {
		return {
			error: "Failed to create.",
		};
	}

	revalidatePath(`/dashboard`);
	return { data: user };
};

export const createUser = createSafeAction(CreateUser, handler);
