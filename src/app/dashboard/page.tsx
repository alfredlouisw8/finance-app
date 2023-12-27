import { gql } from "@apollo/client";
import { getClient } from "@/lib/apollo-server";
import { Card, IconButton, Tooltip, Typography } from "@mui/material";
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
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { User } from "@/types/User";
import Link from "next/link";

const query = gql`
	query getUsersByAdvisor($advisorId: String!) {
		getUsersByAdvisor(advisorId: $advisorId) {
			id
			name
			email
			createdAt
		}
	}
`;

export default async function Page() {
	const client = getClient();
	const {
		data: { getUsersByAdvisor },
	} = await client.query<{ getUsersByAdvisor: Partial<User>[] }>({
		query,
		variables: {
			advisorId: "657ef2f6e07cbd891419275f",
		},
	});

	return (
		<Card>
			<CardHeader className="flex flex-row justify-between items-center">
				<CardTitle>Users List</CardTitle>
				<Button className="mt-0">Add User</Button>
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
						{getUsersByAdvisor.map((data, i) => (
							<TableRow key={data.id}>
								<TableCell className="font-medium">{i + 1}</TableCell>
								<TableCell>{data.name}</TableCell>
								<TableCell>{data.email}</TableCell>
								<TableCell>{data.createdAt}</TableCell>
								<TableCell className="text-right flex items-center justify-end">
									<Link href={`/client/${data.id}`}>
										<Eye />
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
