"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	RadioGroup,
	RadioGroupItem,
} from "../../../../../../components/ui/radio-group";
import { Label } from "../../../../../../components/ui/label";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../../../../components/ui/card";
import { riskProfileSurvey } from "@/utils/consts";
import Image from "next/image";
import { getRiskProfileResult } from "@/utils/functions";
import { useRouter } from "next/navigation";
import { revalidatePath } from "next/cache";
import { UpdateRiskProfile } from "@/actions/users/updateRiskProfile/schema";
import { useAction } from "@/hooks/useAction";
import { toast } from "../../../../../../components/ui/use-toast";
import { updateRiskProfile } from "@/actions/users/updateRiskProfile";
import { CreateUser } from "@/actions/users/createUser/schema";
import { Input } from "../../../../../../components/ui/input";

const formSchema = UpdateRiskProfile;

export function RiskProfileSurveyForm({ id }: { id: string }) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			clientId: id,
		},
	});

	const router = useRouter();

	const { execute, fieldErrors, isLoading } = useAction(updateRiskProfile, {
		onSuccess: () => {
			toast({
				title: "Risk profile successfully created",
			});
			router.replace(`/client/${id}`);
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
				{riskProfileSurvey.map((question, questionIndex) => (
					<Card key={questionIndex}>
						<CardHeader>
							<CardTitle>
								{questionIndex + 1}. {question.question}
							</CardTitle>
							{question.image && (
								<Image
									src={question.image}
									alt={question.name}
									height={500}
									width={500}
									style={{ objectFit: "contain" }}
								/>
							)}
						</CardHeader>
						<CardContent>
							<FormField
								control={form.control}
								name={question.name as keyof typeof formSchema.strip}
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												{question.choices.map((choice, choiceIndex) => (
													<div
														className="flex items-center space-x-2"
														key={choiceIndex}
													>
														<RadioGroupItem
															value={
																(questionIndex > 0
																	? choice.point * question.weight
																	: choice.point) + ""
															} //first question weight is 0
															id={`${question.name}_choice${choiceIndex + 1}`}
														/>
														<Label
															htmlFor={`${question.name}_choice${
																choiceIndex + 1
															}`}
														>
															{choice.text}
														</Label>
													</div>
												))}
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>
				))}
				<Button aria-disabled={isLoading} type="submit">
					Submit
				</Button>
			</form>
		</Form>
	);
}
