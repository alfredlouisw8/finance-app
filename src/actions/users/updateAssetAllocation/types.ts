import { z } from "zod";
import { User } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdateAssetAllocation } from "./schema";

export type InputType = z.infer<typeof UpdateAssetAllocation>;
export type ReturnType = ActionState<InputType, User>;
