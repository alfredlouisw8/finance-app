// /graphql/types/User.ts
import { builder } from "../builder";

builder.prismaObject("User", {
	fields: (t) => ({
		id: t.exposeID("id"),
		email: t.exposeString("email", { nullable: true }),
		name: t.exposeString("name", { nullable: true }),
		phone: t.exposeString("phone", { nullable: true }),
		role: t.expose("role", { type: Role }),
		advisorId: t.exposeString("advisorId", { nullable: true }),
		advisor: t.relation("advisor"),
		users: t.relation("users"),
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
