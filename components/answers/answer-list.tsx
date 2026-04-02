'use client'

import React, { useState } from "react";
import { AnswerFilters } from "@/constants/filters";
import { useInfiniteAnswers } from "@/lib/axios/answers";
import InfiniteScrollTrigger from "@/components/common/infinite-scroll-trigger";
import { useCurrentUser } from "@/lib/axios/users";
import Link from "next/link";
import Image from "next/image";
import { getTimestamp } from "@/lib/utils";
import ParseHTML from "@/components/common/parse-html";
import AnswerVoteButtons from "./answer-vote-buttons";
import DeleteAnswer from "./delete-answer";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AnswerListProps {
    questionId: number;
    totalAnswers: number;
    /** From getQuestionById: platform or loop mod can delete others' answers. */
    canModerateAnswers?: boolean;
}

const AnswerList = ({ questionId, totalAnswers, canModerateAnswers = false }: AnswerListProps) => {
    const [currentFilter, setCurrentFilter] = useState("recent");
    const { data: currentUser } = useCurrentUser();

    const {
        data: answersData,
        isLoading: loading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteAnswers({
        questionId,
        sortBy: currentFilter,
        pageSize: 10
    });

    const answers = answersData?.pages.flatMap((p) => p.answers) ?? [];

    const handleFilterChange = (filter: string) => {
        setCurrentFilter(filter);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            {/* Header with filter */}
            <div className={answers.length > 0 ? "flex items-center justify-between mb-6" : "hidden"}>
                <h3 className="text-xl font-semibold text-[#000000] dark:text-[#FFFFFF]">
                    {totalAnswers} Answer{totalAnswers !== 1 ? 's' : ''}
                </h3>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#5C5C7B] dark:text-[#858EAD]">Sort by:</span>
                    <Select value={currentFilter} onValueChange={(value) => handleFilterChange(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {AnswerFilters.map((filter) => (
                                    <SelectItem key={filter.value} value={filter.value}>
                                        {filter.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Answers List */}
            <div className="space-y-6">
                {answers.map((answer) => (
                    <div key={answer.id} className="border-b border-[#cbcbcb] dark:border-[#212734] pb-6">
                        {/* Answer Header */}
                        <div className="flex items-center justify-between mb-4">
                            <Link
                                href={`/profile/${answer.author?.clerkId}`}
                                className="flex items-center gap-3"
                            >
                                <div className="size-8 overflow-hidden rounded-full">
                                    <Image
                                        src={answer.author?.picture || "/assets/icons/avatar.svg"}
                                        alt="author profile"
                                        width={32}
                                        height={32}
                                        className="size-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                                        {answer.author?.name || "Unknown User"}
                                    </p>
                                    <p className="text-sm text-[#5C5C7B] dark:text-[#858EAD]">
                                        @{answer.author?.username || "unknown"} • {getTimestamp(answer.createdAt)}
                                    </p>
                                </div>
                            </Link>

                            <div className="flex items-center gap-3">
                                {/* Vote Buttons for Answers */}
                                <AnswerVoteButtons
                                    answerId={answer.id}
                                    totalVotes={answer.totalVotes}
                                />

                                {currentUser?.success &&
                                    currentUser.user &&
                                    (answer.authorId === currentUser.user.id || canModerateAnswers) && (
                                        <DeleteAnswer
                                            answerId={answer.id}
                                            userId={currentUser.user.id}
                                        />
                                    )}
                            </div>
                        </div>

                        {/* Answer Content */}
                        <div className="prose prose-base max-w-none text-[#212734] dark:text-[#DCE3F1]">
                            <ParseHTML
                                data={answer.content}
                                classname="whitespace-pre-wrap leading-relaxed"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {(answers.length > 0 || hasNextPage) && (
                <InfiniteScrollTrigger
                    hasNextPage={!!hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                />
            )}

            {/* No answers message */}
            {answers.length === 0 && (
                <div className="text-center py-8">
                    <h3 className="text-lg font-semibold text-[#000000] dark:text-[#FFFFFF] mb-2">
                        No answers yet
                    </h3>
                    <p className="text-[#5C5C7B] dark:text-[#858EAD]">
                        Be the first to answer this question!
                    </p>
                </div>
            )}
        </div>
    );
};

export default AnswerList;
