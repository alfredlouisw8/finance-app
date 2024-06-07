import { z } from "zod";
import { Holding, User } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { DeleteUser } from "./schema";

export type InputType = z.infer<typeof DeleteUser>;
export type ReturnType = ActionState<InputType, User>;
