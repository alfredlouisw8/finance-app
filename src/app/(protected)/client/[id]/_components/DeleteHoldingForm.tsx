"use client";

import { useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CreateHolding } from "@/actions/holding/createHolding/schema";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "@/hooks/useAction";
import { toast } from "@/components/ui/use-toast";
import { createHolding } from "@/actions/holding/createHolding";
import { z } from "zod";
import yahooFinance from "yahoo-finance2";
import { Input } from "@/components/ui/input";
import NumberInput from "@/components/form/NumberInput";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Holding, HoldingType } from "@prisma/client";
import { UpdateHolding } from "@/actions/holding/updateHolding/schema";
import { updateHolding } from "@/actions/holding/updateHolding";
import HoldingForm from "./HoldingForm";
import { DeleteHolding } from "@/actions/holding/deleteHolding/schema";
import { deleteHolding } from "@/actions/holding/deleteHolding";
import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
	portfolioId: string;
	userId: string;
	holdingId: string;
};

export default function DeleteHoldingForm({
	portfolioId,
	userId,
	holdingId,
}: Props) {
	const formSchema = DeleteHolding;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			portfolioId,
			userId,
			holdingId,
		},
	});

	const { execute, fieldErrors } = useAction(deleteHolding, {
		onSuccess: () => {
			toast({
				title: `Holding successfully deleted`,
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
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<input type="hidden" name="holdingId" value={holdingId} />
					<input type="hidden" name="portfolioId" value={portfolioId} />
					<input type="hidden" name="userId" value={userId} />
					<p>Are you sure?</p>
					<div className="flex justify-end">
						<Button type="submit">Continue</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
