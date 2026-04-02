"use server";

import { db } from "@/db";
import { questions, users } from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { AssignGlobalRoleParams, GetAllUsersForAdminParams } from "./shared.types";
import { canManageUsers, getUserRole } from "./permissions";

export async function assignGlobalRole(params: AssignGlobalRoleParams) {
    try {
        const { adminUserId, targetUserId, role, path } = params;

        if (adminUserId === targetUserId) {
            return { success: false, error: "Cannot change your own role with this action" };
        }

        const adminR = await getUserRole(adminUserId);
        if (!canManageUsers(adminR)) {
            return { success: false, error: "Unauthorized: Only platform admins can assign roles" };
        }

        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId),
        });
        if (!target) {
            return { success: false, error: "User not found" };
        }

        await db.update(users).set({ role }).where(eq(users.id, targetUserId));

        const client = await clerkClient();
        await client.users.updateUser(target.clerkId, {
            publicMetadata: { userId: targetUserId, role },
        });

        revalidatePath(path);
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("assignGlobalRole error:", error);
        return { success: false, error: "Failed to assign role" };
    }
}

export async function getModeratorDashboardStats() {
    const [userRow] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [questionRow] = await db.select({ count: sql<number>`count(*)::int` }).from(questions);

    return {
        userCount: userRow?.count ?? 0,
        questionCount: questionRow?.count ?? 0,
        /** Placeholder until a reports/flags table exists */
        flaggedContentCount: 0,
    };
}

export async function getAllUsersForAdmin(params: GetAllUsersForAdminParams) {
    try {
        const { page = 1, pageSize = 20, searchQuery } = params;
        const skipAmount = (page - 1) * pageSize;

        const searchConditions = [];
        if (searchQuery) {
            searchConditions.push(
                or(
                    ilike(users.name, `%${searchQuery}%`),
                    ilike(users.username, `%${searchQuery}%`),
                    ilike(users.email, `%${searchQuery}%`)
                )
            );
        }

        const allConditions =
            searchConditions.length > 0 ? (searchConditions.length === 1 ? searchConditions[0]! : or(...searchConditions)) : undefined;

        const rows = await db
            .select({
                id: users.id,
                clerkId: users.clerkId,
                name: users.name,
                username: users.username,
                email: users.email,
                picture: users.picture,
                reputation: users.reputation,
                role: users.role,
                joinedAt: users.joinedAt,
            })
            .from(users)
            .where(allConditions)
            .orderBy(desc(users.joinedAt))
            .limit(pageSize + 1)
            .offset(skipAmount);

        const isNext = rows.length > pageSize;
        if (isNext) rows.pop();

        return { users: rows, isNext };
    } catch (error) {
        console.error("getAllUsersForAdmin error:", error);
        throw error;
    }
}
