"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "@/hooks/useAction";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { Holding, HoldingType } from "@prisma/client";
import { UpdateHolding } from "@/actions/holding/updateHolding/schema";
import { updateHolding } from "@/actions/holding/updateHolding";
import HoldingForm from "./HoldingForm";

type Props = {
	portfolioId: string;
	userId: string;
	holding: Holding;
};

export default function EditHoldingForm({
	portfolioId,
	userId,
	holding,
}: Props) {
	const closeDialogRef = useRef<HTMLButtonElement>(null);

	const formSchema = UpdateHolding;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			averageBuyPrice: holding.averageBuyPrice || 0,
			amount: holding.amount || 0,
			portfolioId,
			userId,
			ticker: holding.ticker || "",
			holdingId: holding.id,
		},
	});

	const { execute, fieldErrors } = useAction(updateHolding, {
		onSuccess: () => {
			toast({
				title: "Holding successfully updated",
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
			holding={holding}
		/>
	);
}
