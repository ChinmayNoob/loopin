"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import QuestionCard from "@/components/cards/question-card";
import InfiniteScrollTrigger from "@/components/common/infinite-scroll-trigger";
import { useInfiniteQuestionsByTagId } from "@/lib/axios/tags";
import { useUser } from "@clerk/nextjs";

interface PageParams {
    id: string;
}

const TagDetails = ({ params }: { params: Promise<PageParams> }) => {
    const unwrappedParams = use(params);
    const searchParams = useSearchParams();
    const { user } = useUser();

    const searchQuery = searchParams.get("q") || undefined;
    const tagId = parseInt(unwrappedParams.id, 10);

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuestionsByTagId({
        tagId,
        pageSize: 20,
        searchQuery,
    });

    const questions = data?.pages.flatMap((p) => p.questions) ?? [];
    const tagTitle = data?.pages[0]?.tagTitle ?? "";

    if (!Number.isFinite(tagId)) {
        return (
            <div className="mt-10 px-6 text-center">
                <p className="text-red-500">Invalid tag.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] flex-col gap-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
                        Could not load tag
                    </h2>
                    <p className="text-[#5C5C7B] dark:text-[#858EAD] mb-4">
                        The tag may not exist, or there was a network error. Try again later.
                    </p>
                </div>
            </div>
        );
    }

    if (!data?.pages.length) {
        return null;
    }

    return (
        <div className="mt-10 px-6 sm:px-12">
            <h1 className="h1-bold text-dark100_light900 light-border-2 border-b pb-4">
                {tagTitle}
            </h1>

            <div className="mt-5 flex flex-col gap-6">
                {questions.length > 0 ? (
                    questions.map((question) => (
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
                            loop={{
                                id: question.loop?.id || question.loopId || 0,
                                name: question.loop?.name || "No Community",
                                slug: question.loop?.slug || "",
                                description: question.loop?.description || "",
                                picture: question.loop?.picture || "",
                                createdOn: question.loop?.createdOn || new Date(),
                            }}
                            upvotes={question.upvoteCount}
                            downvotes={question.downvoteCount}
                            totalVotes={question.totalVotes}
                            views={question.views || 0}
                            answerCount={question.answerCount}
                            createdAt={question.createdAt}
                            clerkId={user?.id}
                        />
                    ))
                ) : (
                    <div className="mt-10 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <svg
                                className="h-10 w-10 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z"
                                />
                            </svg>
                        </div>
                        <h2 className="h2-bold text-dark200_light900">Ummm.. no questions on this tag yet...</h2>
                        <p className="body-regular text-dark500_light700 mt-4">
                            Be the first to break the silence! Ask a Question and kickstart the discussion.
                        </p>
                        <a
                            href="/ask-question"
                            className="inline-block mt-6 px-6 py-3 bg-[#FF7000] text-white rounded-md hover:bg-[#e6640a] transition-colors"
                        >
                            Ask a Question
                        </a>
                    </div>
                )}
            </div>

            {(questions.length > 0 || hasNextPage) && (
                <InfiniteScrollTrigger
                    hasNextPage={!!hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                />
            )}
        </div>
    );
};

export default TagDetails;
