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
import { HoldingData } from "@/types/Holding";

type Props = {
	holdingsData: HoldingData[];
	userId: string;
	portfolioId: string;
};

export default function PortfolioHoldingTable({
	holdingsData,
	userId,
	portfolioId,
}: Props) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[100px]">No</TableHead>
					<TableHead>Investment Product Name</TableHead>
					<TableHead>Ticker</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Amount</TableHead>
					<TableHead>Avg Buy Price</TableHead>
					<TableHead>Last Price</TableHead>
					<TableHead>Total</TableHead>
					<TableHead>Performance</TableHead>
					<TableHead className="text-right">Action</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{holdingsData.length > 0 ? (
					holdingsData.map((data, i) => {
						return (
							<TableRow key={data.id}>
								<TableCell className="font-medium">{i + 1}</TableCell>
								<TableCell>{data.name || "N/A"}</TableCell>
								<TableCell>{data.ticker}</TableCell>
								<TableCell>{data.type}</TableCell>
								<TableCell>{data.amount.toFixed(2)}</TableCell>
								<TableCell>{data.averageBuyPrice}</TableCell>
								<TableCell>{data.lastPrice}</TableCell>
								<TableCell>{`IDR ${numberWithCommas(data.value)}`}</TableCell>
								<TableCell>
									{calculatePerformance(
										data.averageBuyPrice,
										data.lastPrice as number
									)}
								</TableCell>
								<TableCell className="text-right flex items-center justify-end gap-3">
									<Dialog>
										<DialogTrigger asChild>
											<Button>
												<Pencil size={20} />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Edit Holding</DialogTitle>
											</DialogHeader>

											<EditHoldingForm
												portfolioId={portfolioId}
												userId={userId}
												holding={data}
											/>
										</DialogContent>
									</Dialog>

									<Dialog>
										<DialogTrigger asChild>
											<Button variant="destructive">
												<Trash2 size={20} />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Delete Holding</DialogTitle>
											</DialogHeader>

											<DeleteHoldingForm
												userId={userId}
												portfolioId={portfolioId}
												holdingId={data.id}
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
