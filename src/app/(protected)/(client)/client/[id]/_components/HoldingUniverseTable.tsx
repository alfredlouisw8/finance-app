"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
	holdingUniverses: HoldingUniverse[];
	userId: string;
};

export default function HoldingUniverseTable({
	holdingUniverses,
	userId,
}: Props) {
	const [selectedItems, setSelectedItems] = useState<string[]>([]);

	const handleSelectAll = () => {
		if (selectedItems.length === holdingUniverses.length) {
			setSelectedItems([]);
		} else {
			setSelectedItems(holdingUniverses.map((item) => item.id));
		}
	};

	const handleSelectItem = (id: string) => {
		if (selectedItems.includes(id)) {
			setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
		} else {
			setSelectedItems([...selectedItems, id]);
		}
	};

	return (
		<>
			<div
				className={`flex justify-end ${
					selectedItems.length === 0 ? "invisible" : ""
				}`}
			>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="destructive" disabled={selectedItems.length === 0}>
							Delete Selected
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Selected Holding Universe</DialogTitle>
						</DialogHeader>

						<DeleteHoldingUniverseForm
							userId={userId}
							holdingUniverseIds={selectedItems}
							setSelectedItems={setSelectedItems}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[50px]">
							<Checkbox
								id="selectAll"
								onCheckedChange={handleSelectAll}
								checked={selectedItems.length === holdingUniverses.length}
							/>
						</TableHead>
						<TableHead className="w-[50px]">No</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Ticker</TableHead>
						<TableHead>Type</TableHead>
						<TableHead className="text-right">Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{holdingUniverses.length > 0 ? (
						holdingUniverses.map((data, i) => (
							<TableRow key={data.id}>
								<TableCell className="w-[50px]">
									<Checkbox
										id={"checkbox_" + data.id}
										checked={selectedItems.includes(data.id)}
										onCheckedChange={() => handleSelectItem(data.id)}
									/>
								</TableCell>
								<TableCell className="font-medium">{i + 1}</TableCell>
								<TableCell>{data.name}</TableCell>
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
												holdingUniverseIds={[data.id]}
												setSelectedItems={setSelectedItems}
											/>
										</DialogContent>
									</Dialog>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={10} className="text-center">
								No data to display
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}
