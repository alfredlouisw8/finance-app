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
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

type Props = {
	userId: string;
};

export default function OptimizePortfolioForm({ userId }: Props) {
	const closeDialogRef = useRef<HTMLButtonElement>(null);
	const formSchema = z.object({
		yearAgo: z.string(),
		userId: z.string(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			yearAgo: "1",
			userId,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const response = await axios.post("/api/optimize", values);
			console.log(response.data); // Response data is typed as UserResponse
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error("Axios error:", error.response?.data);
			} else {
				console.error("Unexpected error:", error);
			}
			throw error;
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="yearAgo"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Start Date</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
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

				<DialogFooter>
					<Button type="submit">Optimize</Button>
					<DialogClose asChild>
						<Button style={{ display: "none" }} ref={closeDialogRef}>
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</form>
		</Form>
	);
}
