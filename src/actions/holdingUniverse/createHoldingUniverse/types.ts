import { z } from "zod";
import { HoldingUniverse } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { CreateHoldingUniverse } from "./schema";

export type InputType = z.infer<typeof CreateHoldingUniverse>;
export type ReturnType = ActionState<InputType, HoldingUniverse>;
