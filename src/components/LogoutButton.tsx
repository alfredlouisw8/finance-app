"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
	return (
		<p className="cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
			Logout
		</p>
	);
}
