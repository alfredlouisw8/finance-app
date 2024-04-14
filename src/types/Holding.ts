import { Holding } from "@prisma/client";

export type HoldingData = Holding & {
	name: string | null | undefined;
	lastPrice: number | undefined;
	initialValue: number;
	value: number;
};
