"use client";

import { deleteUser } from "@/actions/users/deleteUser";
import { useAction } from "@/hooks/useAction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DeleteUser } from "@/actions/users/deleteUser/schema";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

type Props = {
	userId: string;
};

export default function DeleteUserForm({ userId }: Props) {
	const formSchema = DeleteUser;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			userId,
		},
	});

	const { execute, fieldErrors } = useAction(deleteUser, {
		onSuccess: () => {
			toast({
				title: `User successfully deleted`,
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
					<input type="hidden" name="userId" value={userId} />
					<p>Are you sure?</p>
					<div className="flex justify-end">
						<DialogFooter>
							<DialogClose asChild>
								<Button type="submit" disabled={form.formState.isSubmitting}>
									Continue
								</Button>
							</DialogClose>
						</DialogFooter>
					</div>
				</form>
			</Form>
		</>
	);
}
