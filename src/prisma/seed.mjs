// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	const advisor = await prisma.user.create({
		data: {
			email: `advisor@gmail.com`,
			name: "Advisor",
			role: "ADVISOR",
		},
	});

	await prisma.user.create({
		data: {
			email: `user1@gmail.com`,
			name: "User 1",
			role: "USER",
			advisorId: advisor.id,
		},
	});

	await prisma.user.create({
		data: {
			email: `user2@gmail.com`,
			name: "User 2",
			role: "USER",
			advisorId: advisor.id,
		},
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
