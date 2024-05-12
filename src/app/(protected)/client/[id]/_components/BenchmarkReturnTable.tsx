import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getBenchmarkTableData } from "@/utils/functions";

type Props = {
	equities: number;
	fixedIncome: number;
};

export default async function BenchmarkReturnTable({
	equities,
	fixedIncome,
}: Props) {
	const [
		bondsBenchmarkReturn,
		equityBenchmarkReturn,
		portfolioBenchmarkReturn,
	] = await getBenchmarkTableData(equities, fixedIncome);

	return (
		<div className="flex flex-col gap-5">
			<h6>Benchmark Return</h6>
			<p>Bonds: INDO 10Y Gov Bonds</p>
			<p>Equity: IHSG</p>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead colSpan={5} className="text-black text-center">
							Annualized Return
						</TableHead>
					</TableRow>
					<TableRow>
						<TableHead></TableHead>
						<TableHead></TableHead>
						<TableHead>1Y</TableHead>
						<TableHead>3Y</TableHead>
						<TableHead>5Y</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell rowSpan={3} className="bg-white">
							Bonds
						</TableCell>
						<TableCell>Return</TableCell>
						<TableCell>{bondsBenchmarkReturn.return1y.toFixed(2)}%</TableCell>
						<TableCell>{bondsBenchmarkReturn.return3y.toFixed(2)}%</TableCell>
						<TableCell>{bondsBenchmarkReturn.return5y.toFixed(2)}%</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Volatility (Risk)</TableCell>
						<TableCell>
							{bondsBenchmarkReturn.volatility1y.toFixed(2)}%
						</TableCell>
						<TableCell>
							{bondsBenchmarkReturn.volatility3y.toFixed(2)}%
						</TableCell>
						<TableCell>
							{bondsBenchmarkReturn.volatility5y.toFixed(2)}%
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Return/Risk</TableCell>
						<TableCell>
							{(
								bondsBenchmarkReturn.return1y /
								bondsBenchmarkReturn.volatility1y
							).toFixed(2)}
						</TableCell>
						<TableCell>
							{(
								bondsBenchmarkReturn.return3y /
								bondsBenchmarkReturn.volatility3y
							).toFixed(2)}
						</TableCell>
						<TableCell>
							{(
								bondsBenchmarkReturn.return5y /
								bondsBenchmarkReturn.volatility5y
							).toFixed(2)}
						</TableCell>
					</TableRow>

					<TableRow>
						<TableCell rowSpan={3} className="bg-white">
							Equity
						</TableCell>
						<TableCell>Return</TableCell>
						<TableCell>{equityBenchmarkReturn.return1y.toFixed(2)}%</TableCell>
						<TableCell>{equityBenchmarkReturn.return3y.toFixed(2)}%</TableCell>
						<TableCell>{equityBenchmarkReturn.return5y.toFixed(2)}%</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Volatility (Risk)</TableCell>
						<TableCell>
							{equityBenchmarkReturn.volatility1y.toFixed(2)}%
						</TableCell>
						<TableCell>
							{equityBenchmarkReturn.volatility3y.toFixed(2)}%
						</TableCell>
						<TableCell>
							{equityBenchmarkReturn.volatility5y.toFixed(2)}%
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Return/Risk</TableCell>
						<TableCell>
							{(
								equityBenchmarkReturn.return1y /
								equityBenchmarkReturn.volatility1y
							).toFixed(2)}
						</TableCell>
						<TableCell>
							{(
								equityBenchmarkReturn.return3y /
								equityBenchmarkReturn.volatility3y
							).toFixed(2)}
						</TableCell>
						<TableCell>
							{(
								equityBenchmarkReturn.return5y /
								equityBenchmarkReturn.volatility5y
							).toFixed(2)}
						</TableCell>
					</TableRow>

					<TableRow>
						<TableCell rowSpan={3} className="bg-white">
							Portfolio ({equities} - {fixedIncome} Mix)
						</TableCell>
						<TableCell>Return</TableCell>
						<TableCell>
							{portfolioBenchmarkReturn.return1y.toFixed(2)}%
						</TableCell>
						<TableCell>
							{portfolioBenchmarkReturn.return3y.toFixed(2)}%
						</TableCell>
						<TableCell>
							{portfolioBenchmarkReturn.return5y.toFixed(2)}%
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Volatility (Risk)</TableCell>
						<TableCell>
							{portfolioBenchmarkReturn.volatility1y.toFixed(2)}%
						</TableCell>
						<TableCell>
							{portfolioBenchmarkReturn.volatility3y.toFixed(2)}%
						</TableCell>
						<TableCell>
							{portfolioBenchmarkReturn.volatility5y.toFixed(2)}%
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Return/Risk</TableCell>
						<TableCell>
							{(
								portfolioBenchmarkReturn.return1y /
								portfolioBenchmarkReturn.volatility1y
							).toFixed(2)}
						</TableCell>
						<TableCell>
							{(
								portfolioBenchmarkReturn.return3y /
								portfolioBenchmarkReturn.volatility3y
							).toFixed(2)}
						</TableCell>
						<TableCell>
							{(
								portfolioBenchmarkReturn.return5y /
								portfolioBenchmarkReturn.volatility5y
							).toFixed(2)}
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
}
