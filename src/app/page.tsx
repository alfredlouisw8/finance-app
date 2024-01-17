import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Page() {
	const session = await getServerSession(authOptions);

	return (
		<div>
			<p>Landing Page</p>
			{session ? <p>signed in</p> : <p>signed out</p>}
			<Button>
				<Link href="/sign-in">Login</Link>
			</Button>
		</div>
	);
}
