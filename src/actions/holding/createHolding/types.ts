import { z } from "zod";
import { Holding } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { CreateHolding } from "./schema";

export type InputType = z.infer<typeof CreateHolding>;
export type ReturnType = ActionState<InputType, Holding>;
