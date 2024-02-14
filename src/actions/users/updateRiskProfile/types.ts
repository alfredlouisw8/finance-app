import { z } from "zod";
import { User } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdateRiskProfile } from "./schema";

export type InputType = z.infer<typeof UpdateRiskProfile>;
export type ReturnType = ActionState<InputType, User>;
