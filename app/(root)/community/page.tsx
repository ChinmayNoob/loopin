"use client";

import UserCard from "@/components/cards/user-card";
import Filter from "@/components/common/filter";
import InfiniteScrollTrigger from "@/components/common/infinite-scroll-trigger";
import { UserFilters } from "@/constants/filters";
import { useInfiniteAllUsers } from "@/lib/axios/users";
import Link from "next/link";
import React, { useState } from "react";

const Community = () => {
    const [filter, setFilter] = useState<string>("new_users");

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteAllUsers({
        filter,
        pageSize: 9,
    });

    const usersList = data?.pages.flatMap((p) => p.users) ?? [];

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
    };

    if (isLoading) {
        return (
            <div className="px-6 sm:px-12">
                <h1 className="h1-bold text-dark100_light900 mt-5">Community</h1>
                <div className="mt-5 flex items-center justify-center">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 sm:px-12">
                <h1 className="h1-bold text-dark100_light900 mt-5">Community</h1>
                <div className="mt-5 flex items-center justify-center">
                    <p className="paragraph-regular text-red-500">Error loading users. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 sm:px-12">
            <div className="light-border-2 mt-2 flex items-center justify-between gap-5 border-b py-3 sm:items-center">
                <Filter
                    filters={UserFilters}
                    otherClasses="h-[30px]"
                    containerClasses="flex"
                    placeholder="Select a filter"
                    value={filter}
                    onValueChange={handleFilterChange}
                />
            </div>

            <h1 className="h1-bold text-dark100_light900 mt-5">Community</h1>

            <section className="mt-5 grid w-full grid-cols-2 gap-3 max-sm:gap-1 md:grid-cols-3">
                {usersList.length > 0 ? (
                    usersList.map((user) => <UserCard key={user.id} user={user} />)
                ) : (
                    <div className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center col-span-full">
                        <p>No users yet</p>
                        <Link href="/sign-up" className="mt-2 font-bold text-accent-blue">
                            Join to be the first!
                        </Link>
                    </div>
                )}
            </section>

            {(usersList.length > 0 || hasNextPage) && (
                <InfiniteScrollTrigger
                    hasNextPage={!!hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                />
            )}
        </div>
    );
};

export default Community;
