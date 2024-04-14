import { z } from "zod";
import { Portfolio } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { AcceptPortfolioOptimization } from "./schema";

export type InputType = z.infer<typeof AcceptPortfolioOptimization>;
export type ReturnType = ActionState<InputType, Portfolio>;
