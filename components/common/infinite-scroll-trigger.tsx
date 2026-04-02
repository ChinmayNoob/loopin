"use client";

import React, { useCallback, useEffect, useRef } from "react";

interface InfiniteScrollTriggerProps {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void | Promise<unknown>;
    /** Optional label when list end is reached */
    endLabel?: string;
    className?: string;
}

/**
 * Renders a sentinel observed via IntersectionObserver to load the next page.
 */
export default function InfiniteScrollTrigger({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    endLabel = "You're all caught up.",
    className = "",
}: InfiniteScrollTriggerProps) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const loadMore = useCallback(() => {
        if (!hasNextPage || isFetchingNextPage) return;
        void fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first?.isIntersecting) loadMore();
            },
            { rootMargin: "120px", threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    if (!hasNextPage && !isFetchingNextPage) {
        return (
            <div className={`py-8 text-center text-sm text-dark400_light700 ${className}`}>
                {endLabel}
            </div>
        );
    }

    return (
        <div ref={sentinelRef} className={`flex min-h-[48px] w-full items-center justify-center py-6 ${className}`}>
            {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-sm text-dark400_light700">
                    <div className="size-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                    <span>Loading more…</span>
                </div>
            ) : (
                <span className="text-xs text-transparent select-none">Load more</span>
            )}
        </div>
    );
}
