"use server";
import { db } from "@/db";
import { loops, loopMembers, questions, users, tags, questionTags, interactions, votes, answers } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
    CreateLoopParams,
    EditLoopParams,
    DeleteLoopParams,
    JoinLoopParams,
    LeaveLoopParams,
    GetLoopByIdParams,
    GetAllLoopsParams,
    GetLoopQuestionsParams,
    GetUserLoopsParams,
    AskQuestionInLoopParams,
    LoopWithStats,
    GetLoopMembersParams,
} from "./shared.types";

export async function createLoop(params: CreateLoopParams) {
    try {
        const { name, slug, description, picture, creatorId, path } = params;

        // Check if slug already exists
        const existingLoop = await db.query.loops.findFirst({
            where: or(
                eq(loops.slug, slug),
                eq(loops.name, name)
            ),
        });

        if (existingLoop) {
            return { success: false, error: "Loop with this name or slug already exists" };
        }

        // Create the loop
        const [newLoop] = await db
            .insert(loops)
            .values({
                name,
                slug,
                description,
                picture,
            })
            .returning();

        // Add creator as the first member with admin role
        await db.insert(loopMembers).values({
            loopId: newLoop.id,
            userId: creatorId,
            role: "admin",
        });

        // Create interaction record
        await db.insert(interactions).values({
            userId: creatorId,
            action: "create-loop",
        });

        // Increase creator's reputation
        await db
            .update(users)
            .set({ reputation: sql`reputation + 20` })
            .where(eq(users.id, creatorId));

        revalidatePath(path);
        revalidatePath("/loops");
        return { success: true, loop: newLoop };
    } catch (error) {
        console.error("Error creating loop:", error);
        return { success: false, error: "Failed to create loop" };
    }
}

// Edit an existing loop
export async function editLoop(params: EditLoopParams) {
    try {
        const { loopId, name, description, picture, userId, path } = params;

        // Check if loop exists
        const existingLoop = await db.query.loops.findFirst({
            where: eq(loops.id, loopId),
        });

        if (!existingLoop) {
            return { success: false, error: "Loop not found" };
        }

        // Check if user is admin of the loop
        const membership = await db.query.loopMembers.findFirst({
            where: and(
                eq(loopMembers.loopId, loopId),
                eq(loopMembers.userId, userId)
            ),
        });

        if (!membership || membership.role !== "admin") {
            return { success: false, error: "Unauthorized: Only admins can edit this loop" };
        }

        // Update the loop
        await db
            .update(loops)
            .set({
                name: name || existingLoop.name,
                description: description || existingLoop.description,
                picture: picture || existingLoop.picture,
            })
            .where(eq(loops.id, loopId));

        revalidatePath(path);
        return { success: true };
    } catch (error) {
        console.error("Error editing loop:", error);
        return { success: false, error: "Failed to edit loop" };
    }
}


// Delete a loop
export async function deleteLoop(params: DeleteLoopParams) {
    try {
        const { loopId, userId, path } = params;

        // Check if loop exists
        const existingLoop = await db.query.loops.findFirst({
            where: eq(loops.id, loopId),
        });

        if (!existingLoop) {
            return { success: false, error: "Loop not found" };
        }

        // Check if user is admin of the loop
        const membership = await db.query.loopMembers.findFirst({
            where: and(
                eq(loopMembers.loopId, loopId),
                eq(loopMembers.userId, userId)
            ),
        });

        if (!membership || membership.role !== "admin") {
            return { success: false, error: "Unauthorized: Only admins can delete this loop" };
        }

        // Delete related data first (foreign key constraints)
        // Note: Questions in the loop will have their loopId set to null due to cascade
        await db.delete(loopMembers).where(eq(loopMembers.loopId, loopId));
        await db.delete(loops).where(eq(loops.id, loopId));

        revalidatePath(path);
        revalidatePath("/loops");
        return { success: true };
    } catch (error) {
        console.error("Error deleting loop:", error);
        return { success: false, error: "Failed to delete loop" };
    }
}

// Join a loop
export async function joinLoop(params: JoinLoopParams) {
    try {
        const { loopId, userId, path } = params;

        // Check if loop exists
        const existingLoop = await db.query.loops.findFirst({
            where: eq(loops.id, loopId),
        });

        if (!existingLoop) {
            return { success: false, error: "Loop not found" };
        }

        // Check if user is already a member
        const existingMembership = await db.query.loopMembers.findFirst({
            where: and(
                eq(loopMembers.loopId, loopId),
                eq(loopMembers.userId, userId)
            ),
        });

        if (existingMembership) {
            return { success: false, error: "You are already a member of this loop" };
        }

        // Add user as member
        await db.insert(loopMembers).values({
            loopId,
            userId,
            role: "member",
        });

        // Create interaction record
        await db.insert(interactions).values({
            userId,
            action: "join-loop",
        });

        // Small reputation boost for joining
        await db
            .update(users)
            .set({ reputation: sql`reputation + 2` })
            .where(eq(users.id, userId));

        revalidatePath(path);
        return { success: true };
    } catch (error) {
        console.error("Error joining loop:", error);
        return { success: false, error: "Failed to join loop" };
    }
}

// leave a loop
export async function leaveLoop(params: LeaveLoopParams) {
    try {
        const { loopId, userId, path } = params;

        // Check if user is a member
        const membership = await db.query.loopMembers.findFirst({
            where: and(
                eq(loopMembers.loopId, loopId),
                eq(loopMembers.userId, userId)
            ),
        });

        if (!membership) {
            return { success: false, error: "You are not a member of this loop" };
        }

        // Don't allow the last admin to leave
        if (membership.role === "admin") {
            const adminCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(loopMembers)
                .where(and(
                    eq(loopMembers.loopId, loopId),
                    eq(loopMembers.role, "admin")
                ))
                .then((res) => res[0].count);

            if (adminCount <= 1) {
                return { success: false, error: "Cannot leave: You are the last admin of this loop" };
            }
        }

        // Remove membership
        await db.delete(loopMembers).where(and(
            eq(loopMembers.loopId, loopId),
            eq(loopMembers.userId, userId)
        ));

        revalidatePath(path);
        return { success: true };
    } catch (error) {
        console.error("Error leaving loop:", error);
        return { success: false, error: "Failed to leave loop" };
    }
}

// Get loop by ID with stats
export async function getLoopById(params: GetLoopByIdParams): Promise<LoopWithStats> {
    try {
        const { loopId } = params;

        const [loop] = await db
            .select({
                id: loops.id,
                name: loops.name,
                slug: loops.slug,
                description: loops.description,
                picture: loops.picture,
                createdAt: loops.createdOn,
                memberCount: sql<number>`(
                    SELECT COUNT(*) FROM ${loopMembers} 
                    WHERE ${loopMembers.loopId} = ${loops.id}
                )`,
                questionCount: sql<number>`(
                    SELECT COUNT(*) FROM ${questions} 
                    WHERE ${questions.loopId} = ${loops.id}
                )`,
            })
            .from(loops)
            .where(eq(loops.id, loopId));

        if (!loop) {
            throw new Error("Loop not found");
        }

        return loop;
    } catch (error) {
        console.error("Error getting loop:", error);
        throw error;
    }
}

// Get all loops with pagination and search
export async function getAllLoops(params: GetAllLoopsParams) {
    try {
        const { searchQuery, page = 1, pageSize = 20, filter = "newest" } = params;
        const skipAmount = (page - 1) * pageSize;

        const conditions = [];
        if (searchQuery) {
            conditions.push(
                or(
                    ilike(loops.name, `%${searchQuery}%`),
                    ilike(loops.description, `%${searchQuery}%`)
                )
            );
        }

        let orderBy;
        switch (filter) {
            case "newest":
                orderBy = desc(loops.createdOn);
                break;
            case "popular":
                orderBy = desc(sql<number>`(
                    SELECT COUNT(*) FROM ${loopMembers} 
                    WHERE ${loopMembers.loopId} = ${loops.id}
                )`);
                break;
            case "active":
                orderBy = desc(sql<number>`(
                    SELECT COUNT(*) FROM ${questions} 
                    WHERE ${questions.loopId} = ${loops.id}
                )`);
                break;
            default:
                orderBy = desc(loops.createdOn);
                break;
        }

        const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

        const loopsWithStats = await db
            .select({
                id: loops.id,
                name: loops.name,
                slug: loops.slug,
                description: loops.description,
                picture: loops.picture,
                createdAt: loops.createdOn,
                memberCount: sql<number>`(
                    SELECT COUNT(*) FROM ${loopMembers} 
                    WHERE ${loopMembers.loopId} = ${loops.id}
                )`,
                questionCount: sql<number>`(
                    SELECT COUNT(*) FROM ${questions} 
                    WHERE ${questions.loopId} = ${loops.id}
                )`,
            })
            .from(loops)
            .where(whereCondition)
            .orderBy(orderBy)
            .limit(pageSize)
            .offset(skipAmount);

        const totalCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(loops)
            .where(whereCondition)
            .then((res) => res[0].count);

        const isNext = totalCount > skipAmount + loopsWithStats.length;

        return { loops: loopsWithStats, isNext };
    } catch (error) {
        console.error("Error getting all loops:", error);
        throw error;
    }
}

// Get questions in a specific loop
export async function getLoopQuestions(params: GetLoopQuestionsParams) {
    try {
        const { loopId, searchQuery, filter = "newest", page = 1, pageSize = 20 } = params;
        const skipAmount = (page - 1) * pageSize;

        const conditions = [eq(questions.loopId, loopId)];
        if (searchQuery) {
            conditions.push(
                ilike(questions.title, `%${searchQuery}%`),
                ilike(questions.content, `%${searchQuery}%`)
            );
        }

        let orderBy = desc(questions.createdAt);
        const additionalConditions = [];

        switch (filter) {
            case "newest":
                orderBy = desc(questions.createdAt);
                break;
            case "frequent":
                orderBy = desc(questions.views);
                break;
            case "unanswered":
                additionalConditions.push(
                    sql`NOT EXISTS (
                        SELECT 1 FROM ${answers}
                        WHERE ${answers.questionId} = ${questions.id}
                    )`
                );
                orderBy = desc(questions.createdAt);
                break;
        }

        const allConditions = and(...conditions, ...additionalConditions);

        const results = await db
            .select({
                id: questions.id,
                title: questions.title,
                content: questions.content,
                views: questions.views,
                authorId: questions.authorId,
                loopId: questions.loopId,
                createdAt: questions.createdAt,
                author: {
                    id: users.id,
                    clerkId: users.clerkId,
                    name: users.name,
                    username: users.username,
                    email: users.email,
                    picture: users.picture,
                    reputation: users.reputation,
                    leetcodeProfile: users.leetcodeProfile,
                },
                tags: sql<Array<{ id: number; name: string; description: string }>>`(
                    SELECT COALESCE(
                        json_agg(
                            json_build_object(
                                'id', ${tags.id},
                                'name', ${tags.name},
                                'description', ${tags.description}
                            )
                        ) FILTER (WHERE ${tags.id} IS NOT NULL),
                        '[]'::json
                    )
                    FROM ${questionTags}
                    LEFT JOIN ${tags} ON ${questionTags.tagId} = ${tags.id}
                    WHERE ${questionTags.questionId} = ${questions.id}
                )`,
                upvoteCount: sql<number>`(
                    SELECT COUNT(*) FROM ${votes} 
                    WHERE ${votes.questionId} = ${questions.id} 
                    AND ${votes.type} = 'upvote'
                )`,
                downvoteCount: sql<number>`(
                    SELECT COUNT(*) FROM ${votes} 
                    WHERE ${votes.questionId} = ${questions.id} 
                    AND ${votes.type} = 'downvote'
                )`,
                totalVotes: sql<number>`(
                    SELECT COUNT(CASE WHEN ${votes.type} = 'upvote' THEN 1 END) - 
                           COUNT(CASE WHEN ${votes.type} = 'downvote' THEN 1 END)
                    FROM ${votes} 
                    WHERE ${votes.questionId} = ${questions.id}
                )`,
                answerCount: sql<number>`(
                    SELECT COUNT(*) FROM ${answers} 
                    WHERE ${answers.questionId} = ${questions.id}
                )`
            })
            .from(questions)
            .leftJoin(users, eq(questions.authorId, users.id))
            .where(allConditions)
            .orderBy(orderBy)
            .limit(pageSize)
            .offset(skipAmount);

        const totalCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(questions)
            .where(allConditions)
            .then((res) => res[0].count);

        const isNext = totalCount > skipAmount + results.length;

        return { questions: results, isNext };
    } catch (error) {
        console.error("Error getting loop questions:", error);
        throw error;
    }
}

// Get user's joined loops
export async function getUserLoops(params: GetUserLoopsParams) {
    try {
        const { userId, page = 1, pageSize = 20 } = params;
        const skipAmount = (page - 1) * pageSize;

        const userLoops = await db
            .select({
                id: loops.id,
                name: loops.name,
                slug: loops.slug,
                description: loops.description,
                picture: loops.picture,
                createdAt: loops.createdOn,
                role: loopMembers.role,
                joinedAt: loopMembers.joinedAt,
                memberCount: sql<number>`(
                    SELECT COUNT(*) FROM ${loopMembers} lm
                    WHERE lm.loop_id = ${loops.id}
                )`,
                questionCount: sql<number>`(
                    SELECT COUNT(*) FROM ${questions} 
                    WHERE ${questions.loopId} = ${loops.id}
                )`,
            })
            .from(loopMembers)
            .innerJoin(loops, eq(loopMembers.loopId, loops.id))
            .where(eq(loopMembers.userId, userId))
            .orderBy(desc(loopMembers.joinedAt))
            .limit(pageSize)
            .offset(skipAmount);

        const totalCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(loopMembers)
            .where(eq(loopMembers.userId, userId))
            .then((res) => res[0].count);

        const isNext = totalCount > skipAmount + userLoops.length;

        return { loops: userLoops, isNext };
    } catch (error) {
        console.error("Error getting user loops:", error);
        throw error;
    }
}

// Ask a question in a loop
export async function askQuestionInLoop(params: AskQuestionInLoopParams) {
    try {
        const { title, content, tags: tagNames, authorId, loopId, path } = params;

        // Check if user is a member of the loop
        if (!loopId) throw new Error("Loop ID is required");

        const membership = await db.query.loopMembers.findFirst({
            where: and(
                eq(loopMembers.loopId, loopId),
                eq(loopMembers.userId, authorId)
            ),
        });

        if (!membership) {
            return { success: false, error: "You must be a member of this loop to ask questions" };
        }

        // Create the question
        const [question] = await db
            .insert(questions)
            .values({
                title,
                content,
                authorId,
                loopId,
            })
            .returning();

        // Create or get tags and create question-tag relations
        for (const tagName of tagNames) {
            const normalizedTagName = tagName.toUpperCase().trim();

            let tag = await db.query.tags.findFirst({
                where: eq(tags.name, normalizedTagName),
            });

            if (!tag) {
                const [createdTag] = await db
                    .insert(tags)
                    .values({
                        name: normalizedTagName,
                        description: `Questions about ${normalizedTagName}`,
                    })
                    .returning();
                tag = createdTag;
            }

            await db.insert(questionTags).values({
                questionId: question.id,
                tagId: tag.id,
            });
        }

        // Create interaction record
        await db.insert(interactions).values({
            userId: authorId,
            questionId: question.id,
            action: "ask-question",
        });

        // Increment author reputation
        await db
            .update(users)
            .set({ reputation: sql`reputation + 5` })
            .where(eq(users.id, authorId));

        revalidatePath(path);
        return { success: true, question };
    } catch (error) {
        console.error("Error asking question in loop:", error);
        return { success: false, error: "Failed to ask question in loop" };
    }
}

// Get loop members
export async function getLoopMembers(params: GetLoopMembersParams) {
    try {
        const { loopId, page = 1, pageSize = 20 } = params;
        const skipAmount = (page - 1) * pageSize;

        const members = await db
            .select({
                id: users.id,
                clerkId: users.clerkId,
                name: users.name,
                username: users.username,
                picture: users.picture,
                reputation: users.reputation,
                role: loopMembers.role,
                joinedAt: loopMembers.joinedAt,
            })
            .from(loopMembers)
            .innerJoin(users, eq(loopMembers.userId, users.id))
            .where(eq(loopMembers.loopId, loopId))
            .orderBy(desc(loopMembers.joinedAt))
            .limit(pageSize)
            .offset(skipAmount);

        const totalCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(loopMembers)
            .where(eq(loopMembers.loopId, loopId))
            .then((res) => res[0].count);

        const isNext = totalCount > skipAmount + members.length;

        return { members, isNext };
    } catch (error) {
        console.error("Error getting loop members:", error);
        throw error;
    }
}

// Check if user is member of a loop
export async function isUserMemberOfLoop(loopId: number, userId: number): Promise<boolean> {
    try {
        const membership = await db.query.loopMembers.findFirst({
            where: and(
                eq(loopMembers.loopId, loopId),
                eq(loopMembers.userId, userId)
            ),
        });

        return !!membership;
    } catch (error) {
        console.error("Error checking loop membership:", error);
        return false;
    }
}

// Get popular loops
export async function getPopularLoops(limit: number = 10) {
    try {
        const popularLoops = await db
            .select({
                id: loops.id,
                name: loops.name,
                slug: loops.slug,
                description: loops.description,
                picture: loops.picture,
                memberCount: sql<number>`(
                    SELECT COUNT(*) FROM ${loopMembers} 
                    WHERE ${loopMembers.loopId} = ${loops.id}
                )`,
            })
            .from(loops)
            .orderBy(desc(sql<number>`(
                SELECT COUNT(*) FROM ${loopMembers} 
                WHERE ${loopMembers.loopId} = ${loops.id}
            )`))
            .limit(limit);

        return popularLoops;
    } catch (error) {
        console.error("Error getting popular loops:", error);
        throw error;
    }
}






