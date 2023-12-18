import { getClient } from "@/lib/apollo-server";

import { gql } from "@apollo/client";
import { getSession } from "@auth0/nextjs-auth0";

export const revalidate = 5;
const query = gql`
	query Users {
		users {
			id
			email
		}
	}
`;

export default async function Page() {
	const client = getClient();
	const { data } = await client.query({ query });
	const session = await getSession();

	return (
		<main>
			{data.users.map((user: any) => (
				<>
					<p>{user.id}</p>
					<p>{user.email}</p>
				</>
			))}
			<p>{session ? "logged in" : "logged out"}</p>

			<a href="/api/auth/logout">LOGOUT</a>
		</main>
	);
}
