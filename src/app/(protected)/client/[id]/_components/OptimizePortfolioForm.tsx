"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { HoldingUniverse, User } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { format, sub } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { pieChartColors } from "@/utils/consts";
import PieChart from "@/components/PieChart";
import { optimizePortfolio } from "@/actions/portfolio/optimizePortfolio";

type Props = {
	user: User;
	holdingUniverse: HoldingUniverse[];
	riskFreeRate: string;
};

export default function OptimizePortfolioForm({
	user,
	holdingUniverse,
	riskFreeRate,
}: Props) {
	const closeDialogRef = useRef<HTMLButtonElement>(null);
	const formSchema = z.object({
		yearAgo: z.string(),
		userId: z.string(),
		maxAllocation: z.number(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			yearAgo: "1",
			userId: user.id,
			maxAllocation: 30,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const response = await axios.post(
				process.env.NEXT_PUBLIC_OPTIMIZE_URL as string,
				{
					stocks: holdingUniverse.map((holding) => holding.ticker),
					start_date: format(
						sub(new Date(), {
							years: parseInt(values.yearAgo),
						}),
						"yyyy-MM-dd"
					),
					end_date: format(new Date(), "yyyy-MM-dd"),
					rf: parseFloat(riskFreeRate) / 100,
					max_allocation: values.maxAllocation / 100,
				}
			);

			await optimizePortfolio({
				optimizedWeightJson: response.data,
				currentPortfolioId: user.currentPortfolioId as string,
				proposedPortfolioId: user.proposedPortfolioId as string,
				clientId: user.id,
			});

			toast({
				title: "Portfolio optimized successfully",
				variant: "default",
			});
			closeDialogRef.current?.click();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error("Axios error:", error.response?.data);
			} else {
				console.error("Unexpected error:", error);
			}
			return toast({
				title: "Something went wrong, please try again",
				variant: "destructive",
			});
		}
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="yearAgo"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Start Date</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select start date" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{[...Array(10)].map((_, index) => (
											<SelectItem key={index} value={index + 1 + ""}>
												{index + 1} {index === 0 ? "year" : "years"} ago
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="maxAllocation"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Max Allocation (%)</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="Max Allocation"
										{...field}
										onChange={(e) => {
											field.onChange(parseFloat(e.target.value));
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<DialogFooter>
						<Button type="submit" disabled={form.formState.isSubmitting}>
							Optimize
						</Button>
						<DialogClose asChild>
							<Button style={{ display: "none" }} ref={closeDialogRef}>
								Close
							</Button>
						</DialogClose>
					</DialogFooter>
				</form>
			</Form>
		</>
	);
}
