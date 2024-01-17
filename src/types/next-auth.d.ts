import NextAuth, { DefaultSession } from "next-auth";
import { Role } from "./User";

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			/** The user's postal address. */
			riskProfile?: string;
			equityAllocation?: number;
			fixedIncomeAllocation?: number;
			advisorId: string;
			id: string;
			role?: Role;
		} & DefaultSession["user"];
	}
}
