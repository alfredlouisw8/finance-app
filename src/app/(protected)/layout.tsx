import LogoutButton from "@/components/LogoutButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authOptions } from "@/lib/auth";
import { getAnnualizedReturn } from "@/utils/functions";
import { sub } from "date-fns";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import yahooFinance from "yahoo-finance2";

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);

	return (
		<>
			<div className="p-4  border-b-2">
				<div className="container flex justify-between items-center">
					<Link href="/dashboard">
						<p>Logo</p>
					</Link>
					<DropdownMenu>
						<DropdownMenuTrigger>
							{session ? "signed in" : "signed out"}
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>
								<LogoutButton />
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="p-4 container">{children}</div>
		</>
	);
}
