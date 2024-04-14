import { z } from "zod";
import { Portfolio } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { OptimizePortfolio } from "./schema";

export type InputType = z.infer<typeof OptimizePortfolio>;
export type ReturnType = ActionState<InputType, Portfolio>;
