import Question from "@/components/forms/Question";
import { getUserByClerkId } from "@/lib/actions/users";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
    title: "Ask Question",
    description: "Ask a question page",
};

const Page = async () => {
    const { userId } = await auth();

    if (!userId) redirect("/sign-in");

    const user = await getUserByClerkId(userId);

    if (!user.success) {
        redirect("/sign-in");
    }

    return (
        <div className="mt-10 px-6 sm:px-12">
            <h1 className="h1-bold text-dark100_light900">Ask a question</h1>
            <div className="mt-9">
                <Question userId={user.user!.id} />
            </div>
        </div>
    );
};

export default Page;
