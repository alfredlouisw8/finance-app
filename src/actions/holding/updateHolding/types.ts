import { z } from "zod";
import { Holding } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdateHolding } from "./schema";

export type InputType = z.infer<typeof UpdateHolding>;
export type ReturnType = ActionState<InputType, Holding>;
