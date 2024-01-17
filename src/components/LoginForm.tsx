"use client";

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
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { signIn, signOut } from "next-auth/react";
import { Role } from "@/types/User";
import { Label } from "./ui/label";
import { useState } from "react";
import { toast } from "./ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type Props = {
	role: Role;
};

const formSchema = z
	.object({
		email: z.string().email(),
	})
	.required();

export default function LoginForm({ role }: Props) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const signInResult = await signIn("email", {
			email: `${values.email} ${role}`,
			callbackUrl: `${window.location.origin}/dashboard`,
			redirect: false,
		});

		if (signInResult?.error) {
			return toast({
				title: "Well this did not work...",
				description: "Something went wrong, please try again",
				variant: "destructive",
			});
		}

		return toast({
			title: "Check your email",
			description: "A magic link has been sent to you",
		});
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="capitalize">{role} Login</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="name@example.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								disabled={form.formState.isSubmitting}
								type="submit"
								className="w-full"
							>
								Login with Email
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</>
	);
}
