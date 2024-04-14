import { z } from "zod";
import { Portfolio } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdatePortfolioCash } from "./schema";

export type InputType = z.infer<typeof UpdatePortfolioCash>;
export type ReturnType = ActionState<InputType, Portfolio>;
