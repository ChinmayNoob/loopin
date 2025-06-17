import { db } from "@/db";
import { votes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { questionId, userId } = await request.json();

        if (!questionId || !userId) {
            return NextResponse.json({ error: "Missing questionId or userId" }, { status: 400 });
        }

        // Check if user has voted on this question
        const existingVote = await db.query.votes.findFirst({
            where: and(
                eq(votes.questionId, questionId),
                eq(votes.userId, userId)
            ),
        });

        return NextResponse.json({ vote: existingVote });
    } catch (error) {
        console.error("Error checking vote:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 