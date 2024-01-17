import { authOptions } from "@/lib/auth";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";

export default async function getUserDetail(id: string) {
	const session = await getServerSession(authOptions);

	const response = await prisma.user.findUnique({
		where: {
			id: id,
		},
	});

	return response;
}
