"use client";

import React, { useMemo, useState } from 'react';
import QuestionCard from "@/components/cards/question-card";
import { useQuestions } from "@/lib/axios/questions";
import { useBatchVoteStatus } from "@/lib/axios/interactions";
import { GetQuestionsParams } from "@/lib/actions/shared.types";
import { useCurrentUser } from "@/lib/axios/users";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface QuestionsListProps {
    params: GetQuestionsParams;
    clerkId: string | null;
    showFilter?: boolean;
}

export default function QuestionsList({ params, clerkId, showFilter = false }: QuestionsListProps) {
    const [filter, setFilter] = useState<'newest' | 'frequent' | 'unanswered'>('newest');
    const { data: result, isLoading, error } = useQuestions({
        ...params,
        filter: showFilter ? filter : params.filter
    });

    // Get current user from the custom hook
    const { data: currentUserData } = useCurrentUser();
    const userId = currentUserData?.user?.id;

    // Extract question IDs for batch vote checking
    const questionIds = useMemo(() => {
        return result?.questions?.map(q => q.id) || [];
    }, [result]);

    // Batch check votes for all questions
    const { data: voteStatusMap } = useBatchVoteStatus(
        userId && questionIds.length > 0 ? { questionIds, userId } : null
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-8 flex w-full flex-col">
                <div className="text-center">
                    <p className="body-regular text-red-500">Error loading questions. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 flex w-full flex-col">
            {/* Filter Controls - only show if showFilter is true */}
            {showFilter && (
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                        <Select value={filter} onValueChange={(value) => setFilter(value as 'newest' | 'frequent' | 'unanswered')}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="frequent">Most Viewed</SelectItem>
                                    <SelectItem value="unanswered">Unanswered</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {result && result.questions.length > 0 ? (
                result.questions.map((question) => {
                    // Get vote status for this specific question
                    const voteStatus = voteStatusMap?.get(`question-${question.id}`);

                    return (
                        <QuestionCard
                            key={question.id}
                            _id={question.id.toString()}
                            title={question.title}
                            tags={question.tags.map(tag => ({
                                _id: tag.id.toString(),
                                name: tag.name
                            }))}
                            // Fixed: Use question.loop instead of question.loops
                            loop={{
                                id: question.loop?.id || question.loopId || 0,
                                name: question.loop?.name || "No Community",
                                slug: question.loop?.slug || "",
                                description: question.loop?.description || "",
                                picture: question.loop?.picture || "",
                                createdOn: question.loop?.createdOn || new Date(),
                            }}
                            author={{
                                _id: question.author?.id?.toString() || question.authorId.toString(),
                                clerkId: question.author?.clerkId || "",
                                name: question.author?.name || "Unknown User",
                                picture: question.author?.picture || "/assets/icons/avatar.svg",
                                leetcodeProfile: question.author?.leetcodeProfile || "",
                            }}
                            upvotes={question.upvoteCount}
                            downvotes={question.downvoteCount}
                            totalVotes={question.totalVotes}
                            views={question.views || 0}
                            answerCount={question.answerCount}
                            createdAt={question.createdAt}
                            clerkId={clerkId}
                            voteStatus={voteStatus}
                        />
                    );
                })
            ) : (
                <div className="mt-10 text-center">
                    <h2 className="h2-bold text-dark200_light900">No questions yet</h2>
                    <p className="body-regular text-dark500_light700 mt-4">
                        Be the first to ask a question!
                    </p>
                </div>
            )}
        </div>
    );
}