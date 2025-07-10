'use client'

import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, MessageCircle, Calendar } from "lucide-react";
import { useGetLoopById, useGetLoopQuestions } from "@/lib/axios/loops";
import { useCurrentUser } from "@/lib/axios/users";
import Link from "next/link";
import Image from "next/image";
import { getTimestamp } from "@/lib/utils";
import LoopQuestionsList from "@/components/loops/loops-questions-list";
import JoinLeaveButton from "@/components/loops/join-leave-button";
import { useRouter } from "next/navigation";

interface LoopDetailPageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        q?: string;
        filter?: "newest" | "frequent" | "unanswered";
        page?: string;
    }>;
}

const LoopDetailPage = ({ params, searchParams }: LoopDetailPageProps) => {
    const router = useRouter();
    const unwrappedParams = use(params);
    const unwrappedSearchParams = use(searchParams);
    const loopId = parseInt(unwrappedParams.id);

    // Get loop details
    const { data: loopInfo, isLoading: isLoopLoading, error: loopError } = useGetLoopById({ loopId });
    const { data: currentUser } = useCurrentUser();

    // Get questions parameters
    const searchQuery = unwrappedSearchParams.q || "";
    const filter = unwrappedSearchParams.filter || "newest";
    const page = parseInt(unwrappedSearchParams.page || "1");

    const { data: questionsResult, isLoading: isQuestionsLoading } = useGetLoopQuestions({
        loopId,
        searchQuery,
        filter: filter as "newest" | "frequent" | "unanswered",
        page,
        pageSize: 20,
    });

    if (isLoopLoading || isQuestionsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (loopError || !loopInfo) {
        return (
            <div className="flex items-center justify-center min-h-[400px] flex-col gap-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Loop not found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The loop you&apos;re looking for doesn&apos;t exist or has been removed.
                    </p>
                    <Link href="/loops">
                        <Button className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
                            Back to Loops
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }
    if (isNaN(loopId)) {
        router.push('/404');
        return null;
    }

    // For now, we'll handle membership through the JoinLeaveButton component
    // which will make the API call to check membership status
    const isMember = false; // This will be handled by the JoinLeaveButton component

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Loop Header */}
            <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="w-20 h-20 rounded-lg bg-black dark:bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                            {loopInfo.picture ? (
                                <Image
                                    src={loopInfo.picture}
                                    alt={loopInfo.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white dark:text-black font-bold text-3xl">
                                    {loopInfo.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {loopInfo.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                                {loopInfo.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <Users size={16} />
                                    <span>{loopInfo.memberCount} members</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <MessageCircle size={16} />
                                    <span>{loopInfo.questionCount} questions</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar size={16} />
                                    <span>Created {getTimestamp(loopInfo.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {currentUser?.success && currentUser.user && (
                            <>
                                <JoinLeaveButton
                                    loopId={loopId}
                                    userId={currentUser.user.id}
                                    isMember={isMember}
                                />
                                {isMember && (
                                    <Link href={`/loops/${loopId}/ask-question`}>
                                        <Button className="flex items-center gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black h-10 px-4">
                                            <Plus size={16} />
                                            Ask Question
                                        </Button>
                                    </Link>
                                )}
                            </>
                        )}
                        {!currentUser?.success && (
                            <Link href="/sign-in">
                                <Button variant="outline" className="h-10 px-4">
                                    Sign in to join
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Questions Section */}
            <div className="bg-white dark:bg-black">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Questions
                    </h2>
                </div>

                <LoopQuestionsList
                    questions={questionsResult?.questions || []}
                    isNext={questionsResult?.isNext || false}
                    loopId={loopId}
                    searchQuery={searchQuery}
                    filter={filter as "newest" | "frequent" | "unanswered"}
                    page={page}
                    userClerkId={currentUser?.user?.clerkId || null}
                />
            </div>
        </div>
    );
};

export default LoopDetailPage;