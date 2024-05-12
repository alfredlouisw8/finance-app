"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "@/hooks/useAction";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { HoldingType } from "@prisma/client";
import { CreateHoldingUniverse } from "@/actions/holdingUniverse/createHoldingUniverse/schema";
import { createHoldingUniverse } from "@/actions/holdingUniverse/createHoldingUniverse";
import { Input } from "@/components/ui/input";

type Props = {
	userId: string;
};

export default function HoldingUniverseForm({ userId }: Props) {
	const closeDialogRef = useRef<HTMLButtonElement>(null);

	const formSchema = CreateHoldingUniverse;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			userId,
			ticker: "",
			type: HoldingType.US_STOCK,
		},
	});

	const { execute, fieldErrors } = useAction(createHoldingUniverse, {
		onSuccess: () => {
			toast({
				title: `Holding universe successfully created`,
			});
			closeDialogRef.current?.click();
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
					name="ticker"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Ticker</FormLabel>
							<FormControl>
								<Input placeholder="Ticker" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Type</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select holding type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{Object.values(HoldingType).map((type, i) => (
										<SelectItem key={i} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button type="submit">Submit</Button>
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
