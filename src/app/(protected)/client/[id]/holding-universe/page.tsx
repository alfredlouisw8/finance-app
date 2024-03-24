import getHoldingUniverse from "@/actions/holdingUniverse/getHoldingUniverse";
import getUserDetail from "@/actions/users/getUserDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import HoldingUniverseTable from "../_components/HoldingUniverseTable";
import HoldingUniverseForm from "../_components/HoldingUniverseForm";

export default async function Page({ params }: { params: { id: string } }) {
	const user = await getUserDetail(params.id);

	if (!user) {
		return <p>User not found</p>;
	}

	const holdingUniverses = await getHoldingUniverse(user.id);

	return (
		<Card>
			<CardHeader className="flex flex-row justify-between items-center">
				<CardTitle>Holding Universe</CardTitle>

				<Dialog>
					<DialogTrigger asChild>
						<Button>Create Holding Universe</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>New Holding</DialogTitle>
						</DialogHeader>

						<HoldingUniverseForm userId={params.id} />
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				<HoldingUniverseTable
					holdingUniverses={holdingUniverses}
					userId={params.id}
				/>
			</CardContent>
		</Card>
	);
}
