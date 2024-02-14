"use client";

import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UpdateAssetAllocation } from "@/actions/users/updateAssetAllocation/schema";
import { updateAssetAllocation } from "@/actions/users/updateAssetAllocation";
import { useAction } from "@/hooks/useAction";
import { toast } from "@/components/ui/use-toast";

const formSchema = UpdateAssetAllocation;

type Props = {
	equities: number;
	clientId: string;
};

export default function AssetAllocationForm({ equities, clientId }: Props) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			equities: equities,
			clientId: clientId,
		},
	});

	const { execute, fieldErrors, isLoading } = useAction(updateAssetAllocation, {
		onSuccess: () => {
			toast({
				title: "Asset allocation successfully updated",
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

	const handleSliderChange = (value: number[]) => {
		form.setValue("equities", value[0]);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="equities"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className="flex flex-col gap-5">
									<div className="flex flex-row items-center justify-between">
										<FormLabel>Risky Asset: {field.value}%</FormLabel>
										<FormLabel>Fixed Income: {100 - field.value}%</FormLabel>
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

				<DialogFooter>
					<DialogClose asChild>
						<Button type="submit">Submit</Button>
					</DialogClose>
				</DialogFooter>
			</form>
		</Form>
	);
}
