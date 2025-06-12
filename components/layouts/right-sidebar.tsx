import Image from "next/image";
import Link from "next/link";
import React from "react";
import RenderTag from "@/components/common/render-tags";
import { ChevronRightIcon } from "lucide-react";

const topQuestions = [
    {
        _id: "1",
        title: "How to implement a binary search tree in JavaScript?"
    },
    {
        _id: "2",
        title: "What's the time complexity of quicksort algorithm?"
    },
    {
        _id: "3",
        title: "How to detect a cycle in a linked list using Floyd's algorithm?"
    },
    {
        _id: "4",
        title: "What's the difference between BFS and DFS traversal?"
    },
    {
        _id: "5",
        title: "How to implement dynamic programming for fibonacci sequence?"
    }
];

// Dummy data for popular tags
const popularTags = [
    {
        _id: "tag1",
        name: "binary-tree",
        numberOfQuestions: 45
    },
    {
        _id: "tag2",
        name: "sorting-algorithms",
        numberOfQuestions: 38
    },
    {
        _id: "tag3",
        name: "dynamic-programming",
        numberOfQuestions: 32
    },
    {
        _id: "tag4",
        name: "graph-algorithms",
        numberOfQuestions: 28
    },
    {
        _id: "tag5",
        name: "linked-list",
        numberOfQuestions: 25
    }
];

const RightSideBar = async () => {

    return (
        <section className=" background-light850_dark100 light-border sticky right-0 top-0 flex h-screen w-[310px]  flex-col overflow-y-auto p-6 pt-36 max-xl:hidden">
            <div className="light-border-2 rounded-lg border px-3 py-4">
                <h3 className="h3-bold text-dark200_light900 ">Top questions</h3>
                <div className="mt-7 flex w-full flex-col gap-2">
                    {topQuestions.map((question) => (
                        <Link
                            href={`/question/${question._id}`}
                            key={question._id}
                            className=" flex cursor-pointer items-center justify-between gap-3 rounded-md  p-2 hover:bg-zinc-200/30 dark:hover:bg-dark-4/60"
                        >
                            <p className="text-dark100_light900 line-clamp-2 w-full text-sm underline underline-offset-4">
                                {question.title}
                            </p>
                            <ChevronRightIcon className="h-4 w-4" />

                        </Link>
                    ))}
                </div>
            </div>
            <div className="light-border-2 mt-4 rounded-lg border px-3 py-4">
                <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                        <RenderTag
                            key={tag._id}
                            _id={tag._id}
                            name={tag.name}
                            totalQuestions={tag.numberOfQuestions}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RightSideBar;
