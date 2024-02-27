import { z } from "zod";
import { Holding } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { DeleteHolding } from "./schema";

export type InputType = z.infer<typeof DeleteHolding>;
export type ReturnType = ActionState<InputType, Holding>;
