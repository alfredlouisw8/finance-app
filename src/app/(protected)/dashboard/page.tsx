import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { useRouter } from "next/navigation";
import getUsersByAdvisor from "@/actions/users/getUsersByAdvisor";
import { User } from "@prisma/client";

export default async function Dashboard() {
	const users = await getUsersByAdvisor();

	return (
		<Card>
			<CardHeader className="flex flex-row justify-between items-center">
				<CardTitle>Users List</CardTitle>
				<Button className="mt-0">
					<Link href="/client/new">Add User</Link>
				</Button>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">No</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Member Since</TableHead>
							<TableHead className="text-right">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.length > 0 ? (
							users.map((data, i) => (
								<TableRow key={data.id}>
									<TableCell className="font-medium">{i + 1}</TableCell>
									<TableCell>{data.name}</TableCell>
									<TableCell>{data.email}</TableCell>
									<TableCell>{format(data.createdAt, "dd-MM-yyyy")}</TableCell>
									<TableCell className="text-right flex items-center justify-end">
										<Link href={`/client/${data.id}`}>
											<Eye />
										</Link>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									No data to display
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
