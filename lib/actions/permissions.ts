// Server-only helpers; omit `"use server"` so sync exports are allowed (imported only from other action modules).
import { db } from "@/db";
import { loopMembers, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type GlobalRole = "user" | "moderator" | "admin";
export type LoopRole = "member" | "moderator" | "admin";

export function normalizeGlobalRole(role: string | null | undefined): GlobalRole {
    if (role === "admin" || role === "moderator") return role;
    return "user";
}

export function normalizeLoopRole(role: string | null | undefined): LoopRole | null {
    if (role === "admin" || role === "moderator" || role === "member") return role;
    return null;
}

export async function getUserRole(userId: number): Promise<GlobalRole> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { role: true },
    });
    return normalizeGlobalRole(user?.role);
}

export async function getLoopRole(userId: number, loopId: number): Promise<LoopRole | null> {
    const row = await db.query.loopMembers.findFirst({
        where: and(eq(loopMembers.loopId, loopId), eq(loopMembers.userId, userId)),
        columns: { role: true },
    });
    return normalizeLoopRole(row?.role ?? undefined);
}

export function canModerateGlobally(role: GlobalRole): boolean {
    return role === "admin" || role === "moderator";
}

export function canManageUsers(role: GlobalRole): boolean {
    return role === "admin";
}

export function canModerateLoopRole(loopRole: LoopRole): boolean {
    return loopRole === "admin" || loopRole === "moderator";
}

export async function canModifyQuestion(
    actorUserId: number,
    question: { authorId: number; loopId: number | null }
): Promise<boolean> {
    if (question.authorId === actorUserId) return true;
    const globalRole = await getUserRole(actorUserId);
    if (canModerateGlobally(globalRole)) return true;
    if (question.loopId != null) {
        const loopRole = await getLoopRole(actorUserId, question.loopId);
        if (loopRole && canModerateLoopRole(loopRole)) return true;
    }
    return false;
}

/** Delete others' answers (not: question author unless they are also mod). */
export async function canModerateAnswersOnQuestion(
    actorUserId: number,
    question: { loopId: number | null }
): Promise<boolean> {
    const globalRole = await getUserRole(actorUserId);
    if (canModerateGlobally(globalRole)) return true;
    if (question.loopId != null) {
        const loopRole = await getLoopRole(actorUserId, question.loopId);
        if (loopRole && canModerateLoopRole(loopRole)) return true;
    }
    return false;
}

export async function canModifyAnswer(
    actorUserId: number,
    answer: { authorId: number },
    question: { loopId: number | null }
): Promise<boolean> {
    if (answer.authorId === actorUserId) return true;
    return canModerateAnswersOnQuestion(actorUserId, question);
}
