import React from 'react'
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import Link from "next/link";
import QuestionsList from "@/components/shared/QuestionsList";

export const metadata: Metadata = {
    title: "Home",
    description: "Home page",
};

export default async function Home() {
    const { userId } = await auth();

    return (
        <div className="px-2 sm:px-12 mt-4">
            <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="font-bold text-2xl">All Questions</h1>

                <Link href={`/ask-question`} className="flex justify-end max-sm:w-full">
                    <Button className="px-4 py-2">
                        Ask a Question
                    </Button>
                </Link>
            </div>
            <QuestionsList
                params={{
                    page: 1,
                    pageSize: 10,
                }}
                clerkId={userId}
            />
        </div>
    );
}