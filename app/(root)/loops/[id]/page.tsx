'use client'

import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, MessageCircle, Calendar } from "lucide-react";
import { useGetLoopById, useGetLoopQuestions, useCheckLoopMembership } from "@/lib/axios/loops";
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

    // Check membership status
    const { data: isMember = false } = useCheckLoopMembership(
        loopId,
        currentUser?.user?.id
    );

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

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Loop Header */}
            <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8 overflow-hidden">
                <div className="p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Section - Avatar and Basic Info */}
                        <div className="lg:col-span-8">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                {/* Avatar */}
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black dark:bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                                    {loopInfo.picture ? (
                                        <Image
                                            src={loopInfo.picture}
                                            alt={loopInfo.name}
                                            width={112}
                                            height={112}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white dark:text-black font-bold text-4xl sm:text-5xl">
                                            {loopInfo.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="mb-6">
                                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
                                            {loopInfo.name}
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl">
                                            {loopInfo.description}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                                            <Users size={14} className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{loopInfo.memberCount} members</span>
                                        </div>

                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                                            <MessageCircle size={14} className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{loopInfo.questionCount} questions</span>
                                        </div>

                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                                            <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created {getTimestamp(loopInfo.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Action Buttons */}
                        <div className="lg:col-span-4">
                            <div className="flex flex-col items-stretch lg:items-end gap-3 lg:min-w-[200px]">
                                {currentUser?.success && currentUser.user && (
                                    <>
                                        <JoinLeaveButton
                                            loopId={loopId}
                                            userId={currentUser.user.id}
                                            isMember={isMember}
                                        />
                                        {isMember && (
                                            <div className="flex flex-col gap-3">
                                                <Link href={`/loops/${loopId}/ask-question`}>
                                                    <Button className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black h-11 px-6 min-w-[160px]">
                                                        <Plus size={16} />
                                                        Ask Question
                                                    </Button>
                                                </Link>
                                                <Link href={`/loops/${loopId}/members`}>
                                                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-11 px-6 min-w-[160px]">
                                                        <Users size={16} />
                                                        Members
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                )}
                                {!currentUser?.success && (
                                    <Link href="/sign-in">
                                        <Button variant="outline" className="w-full h-11 px-6 min-w-[160px]">
                                            Sign in to join
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
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