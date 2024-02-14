import { z } from "zod";
import { User } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdatePortfolioContribution } from "./schema";

export type InputType = z.infer<typeof UpdatePortfolioContribution>;
export type ReturnType = ActionState<InputType, User>;
