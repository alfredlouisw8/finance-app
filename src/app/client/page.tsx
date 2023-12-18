"use client";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { gql } from "@apollo/client";
import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

const query = gql`
	query Users {
		users {
			id
			email
		}
	}
`;

export default function Page() {
	const { data } = useSuspenseQuery<any>(query);
	const { user } = useUser();

	return (
		<main>
			{data.users.map((user: any) => (
				<>
					<p>{user.id}</p>
					<p>{user.email}</p>
				</>
			))}

			<p>{user ? "logged in" : "logged out"}</p>
		</main>
	);
}
