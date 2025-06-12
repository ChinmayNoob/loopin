import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(3),
  username: z.string().min(3),
  bio: z.string(),
  leetcodeProfile: z.string().url().optional().nullable().or(z.literal("")),
  location: z.string(),
});
