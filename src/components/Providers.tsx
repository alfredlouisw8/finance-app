"use client";

import { Honeybadger, HoneybadgerErrorBoundary } from "@honeybadger-io/react";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<HoneybadgerErrorBoundary honeybadger={Honeybadger}>
				{children}
			</HoneybadgerErrorBoundary>
		</SessionProvider>
	);
}
