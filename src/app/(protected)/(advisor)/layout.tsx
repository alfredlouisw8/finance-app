import LogoutButton from "@/components/LogoutButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authOptions } from "@/lib/auth";
import { Role } from "@/types/User";
import { getAnnualizedReturn } from "@/utils/functions";
import { sub } from "date-fns";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdvisorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/sign-in");
	}

	if (session.user.role === Role.CLIENT) {
		redirect(`/client/${session.user.id}`);
	}

	return <>{children}</>;
}
