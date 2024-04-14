import { z } from "zod";
import { ApplicationSetting, Holding } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdateEquityRisk } from "./schema";

export type InputType = z.infer<typeof UpdateEquityRisk>;
export type ReturnType = ActionState<InputType, ApplicationSetting[]>;
