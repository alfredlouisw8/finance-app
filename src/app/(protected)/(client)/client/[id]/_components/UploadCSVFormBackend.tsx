"use client";

import { createHoldingUniverse } from "@/actions/holdingUniverse/createHoldingUniverse";
import { uploadHoldingUniverse } from "@/actions/holdingUniverse/uploadHoldingUniverse";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/useAction";
import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";

type Props = {
	userId: string;
};

export default function UploadCSVFormBackend({ userId }: Props) {
	const closeBtnRef = useRef<HTMLButtonElement>(null);

	const [tickers, setTickers] = useState("");
	const [uploading, setUploading] = useState(false);

	const { execute, fieldErrors } = useAction(createHoldingUniverse, {
		onSuccess: () => {
			toast({
				title: `Holding universe successfully created`,
			});
			closeBtnRef.current?.click();
		},
		onError: (error) => {
			toast({
				title: error,
				variant: "destructive",
			});
		},
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			Papa.parse(file, {
				complete: (results) => {
					const tickers = results.data
						.map((row: any) => row.Ticker)
						.filter((ticker: string) => ticker && ticker.trim() !== "")
						.join(";");
					console.log(tickers);
					setTickers(tickers);
				},
				header: true,
			});
		}
	};

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setUploading(true);
		await execute({ ticker: tickers, userId: userId });
		setUploading(false);
	}

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-3">
			<input type="hidden" name="userId" value={userId} />
			<Input
				type="file"
				name="file"
				placeholder="Upload CSV"
				accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
				onChange={handleFileChange}
			/>

			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" className="hidden" ref={closeBtnRef}>
						Close
					</Button>
				</DialogClose>
			</DialogFooter>
			<div className="flex justify-end">
				<Button type="submit" disabled={uploading}>
					Submit
				</Button>
			</div>
		</form>
	);
}
