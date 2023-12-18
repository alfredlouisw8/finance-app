// /graphql/resolvers.ts
import prisma from "../lib/prisma";
export const resolvers = {
	Query: {
		users: () => {
			return prisma.user.findMany();
		},
	},
};
