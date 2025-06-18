'use client'

import { Button } from "@/components/ui/button";
import { getTimestamp } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import RenderTag from "@/components/common/render-tags";
import ParseHTML from "@/components/common/parse-html";
import VoteButtons from "@/components/questions/vote-buttons";
import DeleteQuestion from "@/components/questions/delete-question";
import AnswerList from "@/components/answers/answer-list";
import CreateAnswer from "@/components/answers/create-answer";
import { useQuestionInfo } from "@/lib/axios/questions";
import { useCurrentUser } from "@/lib/axios/users";
import { FaArrowLeft } from "react-icons/fa";
import { use } from "react";

interface PageParams {
    id: string;
}

const QuestionDetails = ({ params }: { params: Promise<PageParams> }) => {
    const unwrappedParams = use(params);
    console.log(unwrappedParams);
    const { data: questionInfo, isLoading, error } = useQuestionInfo(unwrappedParams.id);
    const { data: currentUser } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7000]"></div>
            </div>
        );
    }

    if (error || !questionInfo) {
        return (
            <div className="flex items-center justify-center min-h-[400px] flex-col gap-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">Question not found</h2>
                    <p className="text-[#5C5C7B] dark:text-[#858EAD] mb-4">
                        The question you're looking for doesn't exist or has been removed.
                    </p>
                    <Link href="/">
                        <Button className="primary-gradient text-light900_dark100">
                            Back to Questions
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const {
        id,
        title,
        content,
        views,
        createdAt,
        author,
        tags,
        upvoteCount,
        downvoteCount,
        totalVotes,
        answerCount
    } = questionInfo;

    // Check if current user is the author of the question
    const isAuthor = currentUser?.success && currentUser.user &&
        questionInfo.authorId === currentUser.user.id;

    return (
        <div className="w-full px-6 sm:px-12 py-8">
            {/* Back Button */}
            <div className="mb-6">
                <Link href="/">
                    <Button variant="outline" className="border-[#cbcbcb] dark:border-[#212734] text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F4F6F8] dark:hover:bg-[#151821] flex items-center gap-2">
                        <FaArrowLeft className="size-4" />
                        Back to Questions
                    </Button>
                </Link>
            </div>

            {/* Question Header */}
            <div className="flex-start w-full flex-col">
                <div className="mb-3 flex w-full flex-row items-center justify-between">
                    <Link
                        href={`/profile/${author?.clerkId}`}
                        className="flex items-center justify-start gap-3"
                    >
                        <div className="size-[32px] overflow-hidden rounded-full">
                            <Image
                                src={author?.picture || "/assets/icons/avatar.svg"}
                                alt="user profile picture"
                                width={32}
                                height={32}
                                className="size-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-base font-semibold text-[#000000] dark:text-[#FFFFFF]">
                                {author?.name || "Unknown User"}
                            </p>
                            <p className="text-sm text-[#5C5C7B] dark:text-[#858EAD]">
                                @{author?.username || "unknown"}
                            </p>
                        </div>
                    </Link>

                    <span className="text-sm text-[#5C5C7B] dark:text-[#858EAD] flex items-center gap-2">
                        <Image
                            src="/assets/icons/clock.svg"
                            alt="time"
                            width={16}
                            height={16}
                            className="invert-0 dark:invert"
                        />
                        {getTimestamp(createdAt)}
                    </span>
                </div>

                <h1 className="text-3xl font-bold leading-tight text-[#000000] dark:text-[#FFFFFF] mt-4 mb-6">
                    {title}
                </h1>
            </div>

            {/* Question Content */}
            <div className="prose prose-base max-w-none text-[#212734] dark:text-[#DCE3F1] mb-8">
                <ParseHTML
                    data={content}
                    classname="whitespace-pre-wrap leading-relaxed"
                />
            </div>

            {/* Tags and Voting Section */}
            <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <RenderTag
                            key={tag.id}
                            _id={tag.id.toString()}
                            name={tag.name}
                            showCount={false}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <VoteButtons
                        questionId={id}
                        upvotes={upvoteCount}
                        downvotes={downvoteCount}
                        totalVotes={totalVotes}
                    />

                    <div className="flex items-center gap-2 text-[#5C5C7B] dark:text-[#858EAD]">
                        <Image
                            src="/assets/icons/eye.svg"
                            alt="views"
                            width={16}
                            height={16}
                            className="invert-0 dark:invert"
                        />
                        <span className="text-sm">
                            {views || 0} view{(views || 0) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-[#cbcbcb] dark:border-[#212734] pt-6">
                <div className="flex gap-4 flex-wrap">
                    <Link href="/">
                        <Button variant="outline" className="border-[#cbcbcb] dark:border-[#212734] text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F4F6F8] dark:hover:bg-[#151821]">
                            Back to Questions
                        </Button>
                    </Link>

                    {/* Only show Edit and Delete buttons to the author */}
                    {isAuthor && (
                        <>
                            <Link href={`/question/edit/${id}`}>
                                <Button variant="outline" className="border-[#cbcbcb] dark:border-[#212734] text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F4F6F8] dark:hover:bg-[#151821]">
                                    Edit Question
                                </Button>
                            </Link>
                            <DeleteQuestion questionId={id} />
                        </>
                    )}

                    <Link href="/ask-question">
                        <Button className="primary-gradient text-light900_dark100">
                            Ask a Question
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Answers Section */}
            <AnswerList questionId={id} totalAnswers={answerCount || 0} />

            {/* Create Answer Form */}
            <CreateAnswer questionId={id} />
        </div>
    );
};

export default QuestionDetails;
