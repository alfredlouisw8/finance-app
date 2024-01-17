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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { riskProfileSurvey } from "@/utils/consts";
import Image from "next/image";
import { getRiskProfileResult } from "@/utils/functions";
import { getClient } from "@/lib/apollo-server";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { revalidatePath } from "next/cache";

const mutation = gql`
	mutation updateRiskProfile($id: String!, $riskProfile: String!) {
		updateRiskProfile(id: $id, riskProfile: $riskProfile) {
			id
			riskProfile
		}
	}
`;

const formSchema = z
	.object({
		question1: z.number(),
		question2: z.number(),
		question3: z.number(),
		question4: z.number(),
		question5: z.number(),
		question6: z.number(),
		question7: z.number(),
	})
	.required();

export function RiskProfileSurveyForm({ id }: { id: string }) {
	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const router = useRouter();

	const [updateRiskProfile] = useMutation(mutation);

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.

		values.question1 = 0; //remove question 1's point

		const result = getRiskProfileResult(
			Object.values(values).reduce((a, b) => a + b)
		);

		const response = await updateRiskProfile({
			variables: {
				id,
				riskProfile: result,
			},
		});

		router.replace(`/client/${id}`);
		router.refresh();
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				{riskProfileSurvey.map((question, questionIndex) => (
					<Card key={questionIndex}>
						<CardHeader>
							<CardTitle>{question.question}</CardTitle>
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
								//@ts-ignore
								name={question.name}
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
																questionIndex > 0
																	? choice.point * question.weight
																	: choice.point
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

				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
}
