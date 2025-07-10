"use client";

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGetAllLoops } from "@/lib/axios/loops";
import { useUser } from "@clerk/nextjs";
import LoopsList from "@/components/loops/loops-list";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/lib/axios/users";

const LoopsPage = () => {
    const { user: clerkUser, isLoaded } = useUser();
    const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
    const searchParams = useSearchParams();

    const searchQuery = searchParams.get("q") ?? "";
    const filter = (searchParams.get("filter") ?? "newest") as "newest" | "popular" | "active";
    const page = parseInt(searchParams.get("page") ?? "1");

    const { data: loopsData, isLoading: isLoadingLoops } = useGetAllLoops({
        searchQuery,
        filter,
        page,
        pageSize: 20,
    });

    if (!isLoaded || isLoadingUser || isLoadingLoops) {
        return <div>Loading...</div>; // You might want to use a proper loading component here
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
                userId={currentUser?.success && currentUser.user ? currentUser.user.id : null}
            />
        </div>
    );
};

export default LoopsPage;