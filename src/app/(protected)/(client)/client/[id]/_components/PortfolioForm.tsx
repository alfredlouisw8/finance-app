"use client";

import { updatePortfolioCash } from "@/actions/portfolio/updatePortfolioCash";
import { UpdatePortfolioCash } from "@/actions/portfolio/updatePortfolioCash/schema";
import NumberInput from "@/components/form/NumberInput";
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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/useAction";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = UpdatePortfolioCash;

type Props = {
	portfolioId: string;
	clientId: string;
	cash: number;
};

export default function PortfolioForm({ portfolioId, cash, clientId }: Props) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			cash,
			clientId,
			portfolioId,
		},
	});

	const { execute, fieldErrors, isLoading } = useAction(updatePortfolioCash, {
		onSuccess: () => {
			toast({
				title: "Portfolio cash successfully updated",
			});
		},
		onError: (error) => {
			toast({
				title: error,
				variant: "destructive",
			});
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		await execute(values);

		if (fieldErrors) {
			for (const [key, value] of Object.entries(fieldErrors)) {
				form.setError(key as keyof typeof fieldErrors, {
					type: "manual",
					message: value.join(","),
				});
			}
			return;
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="cash"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cash</FormLabel>
							<FormControl>
								<NumberInput control={form.control} {...field} />
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
	);
}
