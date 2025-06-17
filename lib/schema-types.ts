import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  bio: z.string().optional(),
  leetcodeProfile: z.string().optional(),
  location: z.string().optional(),
});
