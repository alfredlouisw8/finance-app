"use client";

import { updateEquityRisk } from "@/actions/applicationSetting/updateEquityRisk";
import { UpdateEquityRisk } from "@/actions/applicationSetting/updateEquityRisk/schema";
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
import { UserDetail } from "@/types/User";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = UpdateEquityRisk;

type Props = {
	user: Partial<UserDetail>;
	equityRiskPremium?: string;
	riskFreeRate?: string;
};

export default function EquityRiskForm({
	user,
	equityRiskPremium,
	riskFreeRate,
}: Props) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			clientId: user.id,
			equityRiskPremium,
			riskFreeRate,
		},
	});

	const { execute, fieldErrors, isLoading } = useAction(updateEquityRisk, {
		onSuccess: () => {
			toast({
				title: "Equity risk successfully updated",
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
					name="equityRiskPremium"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Equity Risk Premium (%)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="Equity Risk Premium"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="riskFreeRate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Risk Free Rate (%)</FormLabel>
							<FormControl>
								<Input type="number" placeholder="Risk Free Rate" {...field} />
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
