import { pgTable } from 'drizzle-orm/pg-core';
import * as t from "drizzle-orm/pg-core";


// Users table
export const users = pgTable(
    "users",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        clerkId: t.varchar("clerk_id").notNull(),
        name: t.varchar().notNull(),
        username: t.varchar().notNull(),
        email: t.varchar().notNull(),
        password: t.varchar(),
        bio: t.text(),
        picture: t.varchar().notNull(),
        location: t.varchar(),
        leetcodeProfile: t.varchar("leetcode_profile"),
        reputation: t.integer().default(0),
        joinedAt: t.timestamp("joined_at").defaultNow().notNull(),
    }
);