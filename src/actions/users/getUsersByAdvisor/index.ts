import { authOptions } from "@/lib/auth";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export default async function getUsersByAdvisor() {
	const session = await getServerSession(authOptions);

	const response = await prisma.user.findMany({
		where: {
			advisorId: session?.user.id,
		},
	});

	return response;
}
