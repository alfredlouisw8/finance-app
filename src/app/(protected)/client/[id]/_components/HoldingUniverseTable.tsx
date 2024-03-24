import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { calculatePerformance, numberWithCommas } from "@/utils/functions";
import { Pencil, Trash2 } from "lucide-react";
import EditHoldingForm from "./EditHoldingForm";
import DeleteHoldingForm from "./DeleteHoldingForm";
import { HoldingUniverse } from "@prisma/client";
import DeleteHoldingUniverseForm from "./DeleteHoldingUniverseForm";

type Props = {
	holdingUniverses: HoldingUniverse[];
	userId: string;
};

export default function HoldingUniverseTable({
	holdingUniverses,
	userId,
}: Props) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[100px]">No</TableHead>
					<TableHead>Ticker</TableHead>
					<TableHead>Type</TableHead>
					<TableHead className="text-right">Action</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{holdingUniverses.length > 0 ? (
					holdingUniverses.map((data, i) => {
						return (
							<TableRow key={data.id}>
								<TableCell className="font-medium">{i + 1}</TableCell>
								<TableCell>{data.ticker}</TableCell>
								<TableCell>{data.type}</TableCell>
								<TableCell className="text-right flex items-center justify-end gap-3">
									<Dialog>
										<DialogTrigger asChild>
											<Button variant="destructive">
												<Trash2 size={20} />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Delete Holding Universe</DialogTitle>
											</DialogHeader>

											<DeleteHoldingUniverseForm
												userId={userId}
												holdingUniverseId={data.id}
											/>
										</DialogContent>
									</Dialog>
								</TableCell>
							</TableRow>
						);
					})
				) : (
					<TableRow>
						<TableCell colSpan={10} className="text-center">
							No data to display
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
