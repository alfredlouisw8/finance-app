"use client"; // Error components must be Client Components

// eslint-disable-next-line import/no-unresolved
import { useEffect } from "react";
import { Honeybadger } from "@honeybadger-io/react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * error.[js|tsx]: https://nextjs.org/docs/app/building-your-application/routing/error-handling
 * global-error.[js|tsx]: https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-layouts
 *
 * This component is called when:
 *  - on the server, when data fetching methods throw or reject
 *  - on the client, when getInitialProps throws or rejects
 *  - on the client, when a React lifecycle method (render, componentDidMount, etc) throws or rejects
 *      and was caught by the built-in Next.js error boundary
 */
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const { data: session, status } = useSession();

	useEffect(() => {
		if (status === "authenticated") {
			Honeybadger.setContext({
				user_id: session.user.id,
				user_email: session.user.email,
			});
		}

		Honeybadger.notify(error);
	}, [error, session, status]);

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<Card className="max-w-md p-4">
				<CardHeader>Something went wrong!</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3">
						{error.message}
						<Button onClick={() => reset()}>Try again</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
