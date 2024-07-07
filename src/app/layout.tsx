import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import newrelic from "newrelic";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Osher Capital",
	description: "Osher Capital",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// @ts-ignore
	if (newrelic.agent.collector.isConnected() === false) {
		await new Promise((resolve) => {
			// @ts-ignore
			newrelic.agent.on("connected", resolve);
		});
	}

	const browserTimingHeader = newrelic.getBrowserTimingHeader({
		hasToRemoveScriptWrapper: true,
		// @ts-ignore
		allowTransactionlessInjection: true,
	});

	return (
		<html lang="en">
			<body className={inter.className}>
				{children}
				<Toaster />
				<Script
					// We have to set an id for inline scripts.
					// See https://nextjs.org/docs/app/building-your-application/optimizing/scripts#inline-scripts
					id="nr-browser-agent"
					// By setting the strategy to "beforeInteractive" we guarantee that
					// the script will be added to the document's `head` element.
					strategy="beforeInteractive"
					// The body of the script element comes from the async evaluation
					// of `getInitialProps`. We use the special
					// `dangerouslySetInnerHTML` to provide that element body. Since
					// it requires an object with an `__html` property, we pass in an
					// object literal.
					dangerouslySetInnerHTML={{ __html: browserTimingHeader }}
				/>
			</body>
		</html>
	);
}
