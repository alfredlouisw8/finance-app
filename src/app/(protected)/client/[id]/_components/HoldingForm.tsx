"use client";

import { RefObject, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CreateHolding } from "@/actions/holding/createHolding/schema";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "@/hooks/useAction";
import { toast } from "@/components/ui/use-toast";
import { createHolding } from "@/actions/holding/createHolding";
import { z } from "zod";
import yahooFinance from "yahoo-finance2";
import { Input } from "@/components/ui/input";
import NumberInput from "@/components/form/NumberInput";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Holding, HoldingType } from "@prisma/client";
import { UpdateHolding } from "@/actions/holding/updateHolding/schema";
import { updateHolding } from "@/actions/holding/updateHolding";

type Props = {
	closeDialogRef: RefObject<HTMLButtonElement>;
	form: any;
	onSubmit: any;
	holding?: Holding;
};

export default function HoldingForm({
	closeDialogRef,
	form,
	onSubmit,
	holding,
}: Props) {
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<input type="hidden" name="holdingId" value={holding?.id} />
				<FormField
					control={form.control}
					name="ticker"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Ticker</FormLabel>
							<FormControl>
								<Input placeholder="Ticker" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="averageBuyPrice"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Average Buy Price</FormLabel>
							<FormControl>
								<NumberInput control={form.control} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="amount"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Amount</FormLabel>
							<FormControl>
								<NumberInput control={form.control} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Type</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select holding type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{Object.values(HoldingType).map((type, i) => (
										<SelectItem key={i} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button type="submit">Submit</Button>
					<DialogClose asChild>
						<Button style={{ display: "none" }} ref={closeDialogRef}>
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</form>
		</Form>
	);
}
