// /graphql/types/User.ts
import { User } from "@/types/User";
import { builder } from "../builder";

builder.prismaObject("User", {
	fields: (t) => ({
		id: t.exposeID("id"),
		email: t.exposeString("email"),
		name: t.exposeString("name"),
		phone: t.exposeString("phone", { nullable: true }),
		role: t.expose("role", { type: Role }),
		riskProfile: t.exposeString("riskProfile", { nullable: true }),
		equityAllocation: t.exposeInt("equityAllocation", { nullable: true }),
		fixedIncomeAllocation: t.exposeInt("fixedIncomeAllocation", {
			nullable: true,
		}),
		advisorId: t.exposeString("advisorId", { nullable: true }),
		advisor: t.relation("advisor"),
		users: t.relation("users"),
		createdAt: t.expose("createdAt", { type: "Date" }),
	}),
});

const Role = builder.enumType("Role", {
	values: ["USER", "ADVISOR"] as const,
});

builder.queryField("users", (t) =>
	// 2.
	t.prismaField({
		// 3.
		type: ["User"],
		// 4.
		resolve: (query, _parent, _args, _ctx, _info) =>
			prisma.user.findMany({ ...query }),
	})
);

builder.queryField("getUserById", (t) =>
	t.prismaField({
		type: "User",
		args: {
			id: t.arg.string({ required: true }),
		},
		//@ts-ignore
		resolve: async (_query, _parent, args, _ctx, _info) => {
			const { id } = args;
			const user = prisma.user.findUnique({
				where: {
					id: id,
				},
			});
			return user;
		},
	})
);

builder.queryField("getUsersByAdvisor", (t) =>
	// 2.
	t.prismaField({
		// 3.
		type: ["User"],
		args: {
			advisorId: t.arg.string({ required: true }),
		},
		// 4.
		resolve: async (query, _parent, args, ctx, _info) => {
			const { advisorId } = args;
			return prisma.user.findMany({
				where: {
					advisorId: advisorId,
				},
			});
		},
	})
);

builder.mutationField("updateRiskProfile", (t) =>
	t.prismaField({
		type: "User",
		args: {
			riskProfile: t.arg.string({ required: true }),
			id: t.arg.string({ required: true }),
		},
		resolve: async (query, _parent, args, ctx) => {
			const { riskProfile, id } = args;

			// if (!(await ctx).user) {
			// 	throw new Error("You have to be logged in to perform this action");
			// }

			return prisma.user.update({
				...query,
				where: {
					id,
				},
				data: {
					riskProfile,
				},
			});
		},
	})
);

builder.mutationField("updateAssetAllocation", (t) =>
	t.prismaField({
		type: "User",
		args: {
			equity: t.arg.int({ required: true }),
			fixedIncome: t.arg.int({ required: true }),
			id: t.arg.string({ required: true }),
		},
		resolve: async (query, _parent, args, ctx) => {
			const { equity, fixedIncome, id } = args;

			// if (!(await ctx).user) {
			// 	throw new Error("You have to be logged in to perform this action");
			// }

			return prisma.user.update({
				...query,
				where: {
					id,
				},
				data: {
					equityAllocation: equity,
					fixedIncomeAllocation: fixedIncome,
				},
			});
		},
	})
);
