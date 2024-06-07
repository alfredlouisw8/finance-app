"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "@/hooks/useAction";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { acceptPortfolioOptimization } from "@/actions/portfolio/acceptPortfolioOptimization";
import { AcceptPortfolioOptimization } from "@/actions/portfolio/acceptPortfolioOptimization/schema";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

type Props = {
	currentPortfolioId: string;
	proposedPortfolioId: string;
	clientId: string;
};

export default function AcceptOptimizationForm({
	currentPortfolioId,
	proposedPortfolioId,
	clientId,
}: Props) {
	const formSchema = AcceptPortfolioOptimization;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			currentPortfolioId,
			proposedPortfolioId,
			clientId,
		},
	});

	const { execute, fieldErrors } = useAction(acceptPortfolioOptimization, {
		onSuccess: () => {
			toast({
				title: `Portfolio optimization accepted`,
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
					<input
						type="hidden"
						name="currentPortfolioId"
						value={currentPortfolioId}
					/>
					<input
						type="hidden"
						name="proposedPortfolioId"
						value={proposedPortfolioId}
					/>
					<input type="hidden" name="clientId" value={clientId} />
					<p>Are you sure?</p>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="submit">Continue</Button>
						</DialogClose>
					</DialogFooter>
				</form>
			</Form>
		</>
	);
}
