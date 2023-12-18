// graphql/builder.ts

// 1.
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
// @ts-ignore
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import prisma from "../lib/prisma";
import { createContext } from "@/graphql/context";

// 2.
export const builder = new SchemaBuilder<{
	// 3.
	PrismaTypes: PrismaTypes;
	Context: ReturnType<typeof createContext>;
}>({
	// 4.
	plugins: [PrismaPlugin],
	prisma: {
		client: prisma,
	},
});

// 5.
builder.queryType({
	fields: (t) => ({
		ok: t.boolean({
			resolve: () => true,
		}),
	}),
});
