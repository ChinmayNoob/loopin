import LoopQuestion from "@/components/forms/loop-question";
import { getLoopById } from "@/lib/actions/loops";
import { getUserByClerkId } from "@/lib/actions/users";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface Props {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AskQuestionInLoopPage = async ({ params }: Props) => {
    const { userId } = await auth();

    if (!userId) redirect("/sign-in");

    const user = await getUserByClerkId(userId);

    if (!user.success) {
        redirect("/sign-in");
    }

    // Await the params since they're now a Promise in Next.js 15
    const resolvedParams = await params;
    const loopId = parseInt(resolvedParams.id);
    console.log(loopId);

    if (isNaN(loopId)) {
        redirect("/loops");
    }

    try {
        const loop = await getLoopById({ loopId });

        if (!loop) {
            redirect("/loops");
        }

        return (
            <div className="mt-4 px-6 sm:px-12">
                <div className="flex items-center gap-3 mb-6">
                    <h1 className="text-2xl font-bold">Ask a question</h1>
                    <span className="text-gray-500">•</span>
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                        in {loop.name}
                    </span>
                </div>
                <div className="mt-9">
                    <LoopQuestion
                        userId={user.user!.id}
                        loopId={loopId}
                        loopName={loop.name}
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error fetching loop:", error);
        redirect("/loops");
    }
}

export default AskQuestionInLoopPage;