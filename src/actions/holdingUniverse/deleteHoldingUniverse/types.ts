import { z } from "zod";
import { HoldingUniverse } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { DeleteHoldingUniverse } from "./schema";

export type InputType = z.infer<typeof DeleteHoldingUniverse>;
export type ReturnType = ActionState<InputType, HoldingUniverse>;
