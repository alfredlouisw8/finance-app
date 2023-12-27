"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import Link from "next/link";
import PieChart from "./PieChart";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { gql, useMutation } from "@apollo/client";

const formSchema = z
	.object({
		equities: z.number(),
		fixedIncome: z.number(),
	})
	.required();

const mutation = gql`
	mutation updateAssetAllocation(
		$equity: Int!
		$fixedIncome: Int!
		$id: String!
	) {
		updateAssetAllocation(equity: $equity, fixedIncome: $fixedIncome, id: $id) {
			id
		}
	}
`;

export default function RiskProfileSection({ user }) {
	const [equities, setEquities] = useState(user.equityAllocation || 50);
	const fixedIncome = 100 - equities;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			equities: equities,
			fixedIncome: fixedIncome,
		},
	});

	const [updateAssetAllocation] = useMutation(mutation);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.

		console.log(values);
		setEquities(values.equities);

		const response = await updateAssetAllocation({
			variables: {
				id: user.id,
				equity: values.equities,
				fixedIncome: values.fixedIncome,
			},
		});

		console.log(response);
	}

	const pieChartData = {
		labels: ["Fixed Income", "Equities"],
		datasets: [
			{
				label: "percentage",
				data: [equities, fixedIncome],
				backgroundColor: ["rgba(255, 99, 132)", "rgba(54, 162, 235)"],
			},
		],
	};

	const handleSliderChange = (value: number[]) => {
		form.setValue("equities", value[0]);
		form.setValue("fixedIncome", 100 - value[0]);
	};

	return (
		<>
			<CardHeader className="flex-row items-center justify-between">
				<CardTitle>Risk Profile: {user.riskProfile}</CardTitle>
				<div className="flex items-center gap-5">
					<Link href={`/client/${user.id}/risk-profile-survey`}>
						<Button>Take Risk Profile Survey</Button>
					</Link>
					<Dialog>
						<DialogTrigger asChild>
							<Button>Edit Asset Allocation</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Asset Allocation</DialogTitle>
							</DialogHeader>

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-8"
								>
									<FormField
										control={form.control}
										name="equities"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className="flex flex-col gap-5">
														<div className="flex flex-row items-center justify-between">
															<FormLabel>Equity: {field.value}%</FormLabel>
															<FormLabel>
																Fixed Income: {100 - field.value}%
															</FormLabel>
														</div>
														<Slider
															max={100}
															step={10}
															defaultValue={[field.value]}
															onValueChange={handleSliderChange}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="fixedIncome"
										render={({ field }) => (
											<FormItem className="hidden">
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<DialogFooter>
										<DialogClose asChild>
											<Button type="submit">Submit</Button>
										</DialogClose>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex justify-center max-w-[400px] mx-auto">
					<PieChart data={pieChartData} />
				</div>
			</CardContent>
		</>
	);
}
