"use client";

import { Button } from "@/components/ui/button";

import { Form } from "@/components/ui/form";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "@/hooks/useAction";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";

import { deleteHoldingUniverse } from "@/actions/holdingUniverse/deleteHoldingUniverse";
import { DeleteHoldingUniverse } from "@/actions/holdingUniverse/deleteHoldingUniverse/schema";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

type Props = {
	userId: string;
	holdingUniverseIds: string[];
	setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function DeleteHoldingUniverseForm({
	userId,
	holdingUniverseIds,
	setSelectedItems,
}: Props) {
	const formSchema = DeleteHoldingUniverse;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			userId,
			holdingUniverseIds,
		},
	});

	const { execute, fieldErrors } = useAction(deleteHoldingUniverse, {
		onSuccess: () => {
			toast({
				title: `Holding universe successfully deleted`,
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

		setSelectedItems([]);

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
					<input
						type="hidden"
						name="holdingUniverseIds"
						value={holdingUniverseIds}
					/>
					<input type="hidden" name="userId" value={userId} />
					<p>Are you sure?</p>
					<div className="flex justify-end">
						<DialogFooter>
							<DialogClose asChild>
								<Button type="submit">Continue</Button>
							</DialogClose>
						</DialogFooter>
					</div>
				</form>
			</Form>
		</>
	);
}
