"use client";

import { uploadHoldingUniverse } from "@/actions/holdingUniverse/uploadHoldingUniverse";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";

type Props = {
	userId: string;
};

export default function UploadCSVFormFrontend({ userId }: Props) {
	const [formState, action] = useFormState(uploadHoldingUniverse, {
		message: "",
		success: false,
		error: false,
	});

	const closeBtnRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (formState?.success || formState?.error) {
			toast({
				variant: formState.success ? "default" : "destructive",
				title: formState.message,
			});
			closeBtnRef.current?.click();
		}
	}, [formState]);

	return (
		<form action={action} className="flex flex-col gap-3">
			<input type="hidden" name="userId" value={userId} />
			<Input
				type="file"
				name="file"
				placeholder="Upload CSV"
				accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
			/>

			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" className="hidden" ref={closeBtnRef}>
						Close
					</Button>
				</DialogClose>
			</DialogFooter>
			<div className="flex justify-end">
				<Button type="submit">Submit</Button>
			</div>
		</form>
	);
}
