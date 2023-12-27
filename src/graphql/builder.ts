// graphql/builder.ts

// 1.
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
// @ts-ignore
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import prisma from "../lib/prisma";
import { createContext } from "@/graphql/context";
import { DateResolver } from "graphql-scalars";

// 2.
export const builder = new SchemaBuilder<{
	// 3.
	PrismaTypes: PrismaTypes;
	Context: ReturnType<typeof createContext>;
	Scalars: {
		Date: {
			Input: Date;
			Output: Date;
		};
	};
}>({
	// 4.
	plugins: [PrismaPlugin],
	prisma: {
		client: prisma,
	},
});

builder.addScalarType("Date", DateResolver);

// 5.
builder.queryType({
	fields: (t) => ({
		ok: t.boolean({
			resolve: () => true,
		}),
	}),
});

builder.mutationType({
	fields: (t) => ({
		ok: t.boolean({
			resolve: () => true,
		}),
	}),
});
