"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { upvoteQuestion, downvoteQuestion } from "@/lib/actions/questions";
import { useUser } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/users";
import { toast } from "sonner";
import { db } from "@/db";
import { votes } from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface VoteButtonsProps {
    questionId: number;
    upvotes: number;
    downvotes: number;
    totalVotes: number;
}

const VoteButtons = ({ questionId, upvotes, downvotes, totalVotes }: VoteButtonsProps) => {
    const [currentVotes, setCurrentVotes] = useState(totalVotes);
    const [isVoting, setIsVoting] = useState(false);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [hasDownvoted, setHasDownvoted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useUser();
    const pathname = usePathname();

    // Update currentVotes when totalVotes prop changes (after refresh)
    useEffect(() => {
        setCurrentVotes(totalVotes);
    }, [totalVotes]);

    // Check if user has already voted when component mounts
    useEffect(() => {
        const checkUserVote = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const userResult = await getUserByClerkId(user.id);
                if (!userResult.success) {
                    setIsLoading(false);
                    return;
                }

                // Check if user has voted on this question
                const response = await fetch('/api/check-vote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        questionId,
                        userId: userResult.user!.id
                    })
                });

                if (response.ok) {
                    const voteData = await response.json();
                    if (voteData.vote) {
                        if (voteData.vote.type === 'upvote') {
                            setHasUpvoted(true);
                        } else if (voteData.vote.type === 'downvote') {
                            setHasDownvoted(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking user vote:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserVote();
    }, [user, questionId]);

    const handleVote = async (type: 'upvote' | 'downvote') => {
        if (!user) {
            toast.error("Please sign in to vote");
            return;
        }

        if (isVoting) return;
        setIsVoting(true);

        try {
            // Get user from database
            const userResult = await getUserByClerkId(user.id);
            if (!userResult.success) {
                toast.error("User not found");
                return;
            }

            const userId = userResult.user!.id;

            if (type === 'upvote') {
                await upvoteQuestion({
                    questionId,
                    userId,
                    hasupVoted: hasUpvoted,
                    hasdownVoted: hasDownvoted,
                    path: pathname,
                });

                if (hasUpvoted) {
                    setCurrentVotes(prev => prev - 1);
                    setHasUpvoted(false);
                    toast.success("Vote removed");
                } else {
                    setCurrentVotes(prev => prev + (hasDownvoted ? 2 : 1));
                    setHasUpvoted(true);
                    setHasDownvoted(false);
                    toast.success("Question upvoted!");
                }
            } else {
                await downvoteQuestion({
                    questionId,
                    userId,
                    hasupVoted: hasUpvoted,
                    hasdownVoted: hasDownvoted,
                    path: pathname,
                });

                if (hasDownvoted) {
                    setCurrentVotes(prev => prev + 1);
                    setHasDownvoted(false);
                    toast.success("Vote removed");
                } else {
                    setCurrentVotes(prev => prev - (hasUpvoted ? 2 : 1));
                    setHasDownvoted(true);
                    setHasUpvoted(false);
                    toast.success("Question downvoted");
                }
            }
        } catch (error) {
            console.error("Error voting:", error);
            toast.error("Error voting. Please try again.");
        } finally {
            setIsVoting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <div className="animate-pulse bg-gray-200 rounded px-4 py-2 w-20 h-8"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleVote('upvote')}
                disabled={isVoting}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${hasUpvoted
                    ? 'bg-green-100 text-green-600'
                    : 'hover:bg-gray-100 text-gray-600'
                    } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z" />
                </svg>
            </button>

            <span className={`text-sm font-semibold min-w-[40px] text-center ${currentVotes > 0 ? 'text-green-600' :
                currentVotes < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                {currentVotes}
            </span>

            <button
                onClick={() => handleVote('downvote')}
                disabled={isVoting}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${hasDownvoted
                    ? 'bg-red-100 text-red-600'
                    : 'hover:bg-gray-100 text-gray-600'
                    } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 20l-8-8h6V4h4v8h6l-8 8z" />
                </svg>
            </button>
        </div>
    );
};

export default VoteButtons; 