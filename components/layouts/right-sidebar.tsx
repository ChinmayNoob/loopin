"use client";

import React from "react";
import Link from "next/link";
import RenderTag from "../common/render-tags";
import { ChevronRightIcon } from "lucide-react";
import { useTopQuestions } from "@/lib/axios/questions";
import { useTopPopularTags } from "@/lib/axios/tags";
import { Separator } from "../ui/separator";

const RightSideBar = () => {
    const { data: topQuestions, isLoading, error } = useTopQuestions();
    const { data: popularTags, isLoading: tagsLoading, error: tagsError } = useTopPopularTags();

    return (
        <section className="sticky right-0 top-0 flex h-screen w-[310px]  flex-col overflow-y-auto p-6 pt-36 max-xl:hidden">
            <div className="rounded-lg border px-3 py-4 bg-zinc-200 dark:bg-zinc-800">
                <h3 className="text-2xl font-bold text-center text-black dark:text-white">Top questions</h3>
                <Separator className="my-4 bg-black dark:bg-white" />
                <div className="mt-7 flex w-full flex-col gap-2">
                    {isLoading ? (
                        <div className="text-sm">Loading top questions...</div>
                    ) : error ? (
                        <div className="text-red-500 text-sm">Failed to load questions</div>
                    ) : topQuestions && topQuestions.length > 0 ? (
                        topQuestions.map((question) => (
                            <Link
                                href={`/question/${question.id}`}
                                key={question.id}
                                className=" flex cursor-pointer items-center justify-between gap-3 rounded-md  p-2 hover:bg-[#4F46E8]/70 dark:hover:bg-[#4F46E8]/60"
                            >
                                <p className="line-clamp-2 w-full text-sm underline underline-offset-4 text-black dark:text-white">
                                    {question.title}
                                </p>
                                <ChevronRightIcon className="h-4 w-4" />
                            </Link>
                        ))
                    ) : (
                        <div className="text-red-600 text-sm">No questions available</div>
                    )}
                </div>
            </div>
            <Separator className="my-4 bg-black dark:bg-white" />

            <div className="rounded-lg px-3 py-4 bg-zinc-200 dark:bg-zinc-800">
                <h3 className="text-2xl font-bold text-center text-black dark:text-white">Popular Tags</h3>
                <Separator className="my-4 bg-black dark:bg-white" />
                <div className="mt-4 flex flex-wrap gap-2">
                    {tagsLoading ? (
                        <div className="text-sm">Loading popular tags...</div>
                    ) : tagsError ? (
                        <div className="text-red-500 text-sm">Failed to load tags</div>
                    ) : popularTags && popularTags.length > 0 ? (
                        popularTags.map((tag) => (
                            <RenderTag
                                key={tag.id}
                                _id={tag.id.toString()}
                                name={tag.name}
                                totalQuestions={tag.numberOfQuestions}
                            />
                        ))
                    ) : (
                        <div className="text-sm">No tags available</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RightSideBar;
