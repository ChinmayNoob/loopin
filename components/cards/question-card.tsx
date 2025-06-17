import Link from "next/link";
import React from "react";
import { getTimestamp } from "@/lib/utils";
import Image from "next/image";
import VoteButtons from "../questions/vote-buttons";
import { SiLeetcode } from "react-icons/si";

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
    upvotes: number;
    downvotes: number;
    totalVotes: number;
    views: number;
    answers: Array<object>;
    createdAt: Date;
    clerkId?: string | null;
}

const QuestionCard = (props: QuestionProps) => {
    const {
        _id,
        title,
        tags,
        author,
        upvotes,
        downvotes,
        totalVotes,
        views,
        answers,
        createdAt,
    } = props;

    return (
        <div className="card-wrapper light-border-2 border-b px-6 pb-6 pt-5 xs:mt-1 sm:px-10">
            <div className="flex flex-col items-start justify-between gap-4">
                <div className="flex justify-between items-start w-full">
                    <div className="flex items-start gap-2 px-2">
                        <div className="overflow-hidden w-[28px] h-[28px] rounded-full">
                            <Image
                                src={author.picture}
                                height={28}
                                width={28}
                                alt={`author`}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="flex flex-col">
                            <p className="font-semibold">{author.name}</p>
                            <span className="text-xs text-gray-500 mt-1">
                                {getTimestamp(createdAt)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center">
                        {author.leetcodeProfile && (
                            <Link
                                href={author.leetcodeProfile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center hover:opacity-80 transition-opacity"
                                title="LeetCode Profile"
                            >
                                <SiLeetcode
                                    size={14}
                                    className="text-orange-500 hover:text-orange-600 transition-colors"
                                />
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex-between w-full">
                    <Link href={`/question/${_id}`}>
                        <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
                            {title}
                        </h3>
                    </Link>
                </div>
            </div>

            <div className="md:flex-between mt-6 flex w-full flex-col gap-2 md:flex-row">
                <div className="flex flex-wrap gap-2 md:w-2/3">
                    {tags.map((tag) => (
                        <span
                            key={tag._id}
                            className="subtle-medium background-light800_dark300 text-light400_light500 rounded-md border-none px-4 py-2 uppercase"
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <VoteButtons
                        questionId={parseInt(_id)}
                        upvotes={upvotes}
                        downvotes={downvotes}
                        totalVotes={totalVotes}
                    />
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">
                            {answers.length} answers
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">
                            {views} views
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard; 