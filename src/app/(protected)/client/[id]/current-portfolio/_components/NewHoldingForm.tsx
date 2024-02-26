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

type Props = {
	portfolioId: string;
	userId: string;
	holding?: Holding;
};

export default function NewHoldingForm({ portfolioId, userId }: Props) {
	const closeDialogRef = useRef<HTMLButtonElement>(null);

	const formSchema = CreateHolding;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			averageBuyPrice: 0,
			amount: 0,
			portfolioId,
			userId,
			ticker: "",
			type: HoldingType.US_STOCK,
		},
	});

	const { execute, fieldErrors } = useAction(createHolding, {
		onSuccess: () => {
			toast({
				title: `Holding successfully created`,
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
		<HoldingForm
			closeDialogRef={closeDialogRef}
			form={form}
			onSubmit={onSubmit}
		/>
	);
}
