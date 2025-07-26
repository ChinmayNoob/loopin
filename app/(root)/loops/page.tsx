"use client";

import Link from "next/link";
import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGetAllLoops } from "@/lib/axios/loops";
import { useUser } from "@clerk/nextjs";
import LoopsList from "@/components/loops/loops-list";

interface PageProps {
    searchParams: {
        q?: string;
        filter?: string;
        page?: string;
    };
}

const LoopsPage = ({ searchParams: searchParamsPromise }: { searchParams: Promise<PageProps['searchParams']> }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const searchParams = use(searchParamsPromise);

    const searchQuery = searchParams.q ?? "";
    const filter = (searchParams.filter ?? "newest") as "newest" | "popular" | "active";
    const page = parseInt(searchParams.page ?? "1");

    const { data: loopsData, isLoading: isLoadingLoops } = useGetAllLoops({
        searchQuery,
        filter,
        page,
        pageSize: 20,
    });

    if (!isLoaded || isLoadingLoops) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Loops
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Join programming loops and connect with like-minded developers
                    </p>
                </div>

                <div className="flex justify-start">
                    {clerkUser && (
                        <Link href="/loops/create">
                            <Button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
                                <Plus size={16} />
                                Create Loop
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Loops List */}
            <LoopsList
                loops={loopsData?.loops || []}
                isNext={loopsData?.isNext || false}
                searchQuery={searchQuery}
                filter={filter}
                page={page}
            />
        </div>
    );
};

export default LoopsPage;