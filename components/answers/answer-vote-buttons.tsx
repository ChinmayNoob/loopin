"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUpvoteAnswer, useDownvoteAnswer } from "@/lib/axios/answers";
import { useUser } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/users";
import { toast } from "sonner";

interface AnswerVoteButtonsProps {
    answerId: number;
    upvotes: number;
    downvotes: number;
    totalVotes: number;
}

const AnswerVoteButtons = ({ answerId, upvotes, downvotes, totalVotes }: AnswerVoteButtonsProps) => {
    const [currentVotes, setCurrentVotes] = useState(totalVotes);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [hasDownvoted, setHasDownvoted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useUser();
    const pathname = usePathname();
    const upvoteAnswerMutation = useUpvoteAnswer();
    const downvoteAnswerMutation = useDownvoteAnswer();

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

                // Check if user has voted on this answer
                const response = await fetch('/api/check-vote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        answerId,
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
    }, [user, answerId]);

    const handleVote = async (type: 'upvote' | 'downvote') => {
        if (!user) {
            toast.error("Please sign in to vote");
            return;
        }

        const isVoting = upvoteAnswerMutation.isPending || downvoteAnswerMutation.isPending;
        if (isVoting) return;

        try {
            // Get user from database
            const userResult = await getUserByClerkId(user.id);
            if (!userResult.success) {
                toast.error("User not found");
                return;
            }

            const userId = userResult.user!.id;

            if (type === 'upvote') {
                await upvoteAnswerMutation.mutateAsync({
                    answerId,
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
                    toast.success("Answer upvoted!");
                }
            } else {
                await downvoteAnswerMutation.mutateAsync({
                    answerId,
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
                    toast.success("Answer downvoted");
                }
            }
        } catch (error) {
            console.error("Error voting:", error);
            toast.error("Error voting. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <div className="animate-pulse bg-gray-200 rounded px-4 py-2 w-20 h-8"></div>
            </div>
        );
    }

    const isVoting = upvoteAnswerMutation.isPending || downvoteAnswerMutation.isPending;

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleVote('upvote')}
                disabled={isVoting}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${hasUpvoted
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
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
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 20l-8-8h6V4h4v8h6l-8 8z" />
                </svg>
            </button>
        </div>
    );
};

export default AnswerVoteButtons; 