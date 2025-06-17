"use client";

import React from 'react';
import QuestionCard from "@/components/cards/QuestionCard";
import { useQuestions } from "@/lib/axios/questions";
import { GetQuestionsParams } from "@/lib/actions/shared.types";

interface QuestionsListProps {
    params: GetQuestionsParams;
    clerkId: string | null;
}

export default function QuestionsList({ params, clerkId }: QuestionsListProps) {
    const { data: result, isLoading, error } = useQuestions(params);

    if (isLoading) {
        return (
            <div className="mt-8 flex w-full flex-col">
                <div className="text-center">
                    <p className="body-regular text-dark500_light700">Loading questions...</p>
                </div>
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
            {result && result.questions.length > 0 ? (
                result.questions.map((question) => (
                    <QuestionCard
                        key={question.id}
                        _id={question.id.toString()}
                        title={question.title}
                        tags={question.tags.map(tag => ({
                            _id: tag.id.toString(),
                            name: tag.name
                        }))}
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
                        answers={[]}
                        createdAt={question.createdAt}
                        clerkId={clerkId}
                    />
                ))
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