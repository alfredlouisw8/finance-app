// pages/api/graphql.ts

import { createYoga } from "graphql-yoga";
import type { NextApiRequest, NextApiResponse } from "next";
import { schema } from "@/graphql/schema";
import { createContext } from "../../../graphql/context";

const { handleRequest } = createYoga<{
	req: NextApiRequest;
	res: NextApiResponse;
}>({
	schema,
	context: createContext,
	graphqlEndpoint: "/api/graphql",
	fetchAPI: {
		Request: Request,
		Response: Response,
	},
});

export const config = {
	api: {
		bodyParser: false,
	},
};

export { handleRequest as GET, handleRequest as POST };
