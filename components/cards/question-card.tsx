import Link from "next/link";
import React from "react";
import { getTimestamp } from "@/lib/utils";
import Image from "next/image";
import VoteButtons from "../questions/vote-buttons";
import { SiLeetcode } from "react-icons/si";
import { IoBookmarks, IoBookmarksOutline } from "react-icons/io5";
import { useToggleSaveQuestion, useIsQuestionSaved } from "@/lib/axios/users";
import { useViewQuestion } from "@/lib/axios/interactions";
import { useUser } from "@clerk/nextjs";

interface VoteStatus {
    questionId?: number;
    answerId?: number;
    type?: 'upvote' | 'downvote';
    hasVote: boolean;
}

interface QuestionProps {
    _id: string;
    title: string;
    tags: {
        _id: string;
        name: string;
    }[];
    author: {
        _id: string;
        clerkId: string;
        name: string;
        picture: string;
        leetcodeProfile: string;
    };
    loop?: {
        id: number;
        name: string;
        slug: string;
        description: string;
        picture: string;
        createdOn: Date;
    };
    upvotes: number;
    downvotes: number;
    totalVotes: number;
    views: number;
    answerCount: number;
    createdAt: Date;
    clerkId?: string | null;
    voteStatus?: VoteStatus;
}

const QuestionCard = (props: QuestionProps) => {
    const {
        _id,
        title,
        tags,
        author,
        loop,
        totalVotes,
        views,
        answerCount,
        createdAt,
    } = props;

    const { user } = useUser();
    const toggleSaveMutation = useToggleSaveQuestion();
    const viewQuestionMutation = useViewQuestion();
    const [isClient, setIsClient] = React.useState(false);

    const questionId = parseInt(_id);

    const { data: isSaved, isLoading: isSavedLoading } = useIsQuestionSaved(
        user?.id || "",
        questionId
    );

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSaveQuestion = async () => {
        if (!user?.id) {
            return;
        }

        try {
            await toggleSaveMutation.mutateAsync({
                userId: user.id,
                questionId,
                path: "/",
            });
        } catch (error) {
            console.error("Error saving question:", error);
        }
    };

    const handleViewQuestion = () => {
        viewQuestionMutation.mutate({
            questionId,
            userId: user?.publicMetadata?.userId as number | undefined,
        });
    };

    return (
        <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-5 transition-all duration-300 hover:shadow-md">
            {/* Top Section: Author and Save/Link icons */}
            <div className="flex justify-between items-start gap-4">
                {/* Author Info */}
                <div className="flex items-start gap-3">
                    <Link href={`/profile/${author.clerkId}`} className="flex-shrink-0">
                        <Image
                            src={author.picture}
                            height={32}
                            width={32}
                            alt={`${author.name}'s avatar`}
                            className="rounded-full object-cover"
                        />
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                {author.name}
                            </p>
                            {loop && (
                                <>
                                    <span className="text-gray-400 dark:text-gray-600 text-xs">•</span>
                                    <Link href={`/loops/${loop.id}`} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                                        {loop.name}
                                    </Link>
                                </>
                            )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            asked {getTimestamp(createdAt)}
                        </span>
                    </div>
                </div>
                {/* Action Icons */}
                <div className="flex items-center gap-2">
                    {user && isClient && (
                        <button
                            onClick={handleSaveQuestion}
                            disabled={toggleSaveMutation.isPending || isSavedLoading}
                            className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title={isSaved ? "Remove from saved" : "Save question"}
                        >
                            {isSaved ? (
                                <IoBookmarks size={16} className="text-primary-500" />
                            ) : (
                                <IoBookmarksOutline size={16} className="text-gray-500 hover:text-[#4F46E8]" />
                            )}
                        </button>
                    )}
                    {author.leetcodeProfile && (
                        <Link
                            href={author.leetcodeProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="LeetCode Profile"
                        >
                            <SiLeetcode
                                size={16}
                                className="text-orange-500"
                            />
                        </Link>
                    )}
                </div>
            </div>

            {/* Middle Section: Title */}
            <div className="mt-4">
                <Link href={`/question/${_id}`} onClick={handleViewQuestion}>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 hover:text-[#4F46E8] dark:hover:text-[#4F46E8] transition-colors">
                        {title}
                    </h3>
                </Link>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag) => (
                    <span
                        key={tag._id}
                        className="inline-block text-xs font-medium bg-black dark:bg-[#4F46E8] text-white rounded-full px-3 py-1.5"
                    >
                        {tag.name}
                    </span>
                ))}
            </div>


            {/* Bottom Section: Stats */}
            <div className="flex items-center justify-between mt-6">
                <VoteButtons
                    questionId={parseInt(_id)}
                    totalVotes={totalVotes}
                />
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <span>{answerCount}</span>
                        <span>answers</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>{views}</span>
                        <span>views</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard; 