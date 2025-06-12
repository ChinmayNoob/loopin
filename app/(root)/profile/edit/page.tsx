import { ensureUserExists, getUserByClerkId } from "@/lib/actions/users";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import Profile from "@/components/profile/profile";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Edit profile",
    description: "Edit profile page",
};

const ProfileEdit = async ({ params }: ParamsProps) => {
    const { userId } = await auth();
    if (!userId) return null;

    // Ensure user exists in database first
    await ensureUserExists(userId);

    const userResult = await getUserByClerkId(userId);

    // If user is still not found, something is seriously wrong
    if (!userResult.success || !userResult.user) {
        redirect('/');
    }

    return (
        <div className="w-full">
            <div className="text-[#000000] dark:text-[#FFFFFF] mt-1 flex w-full flex-col px-6 pb-2 pt-4 sm:px-12">
                <div className="flex items-start justify-start mb-4">
                    <Link href={`/profile/${userResult.user.id}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-[#5C5C7B] dark:text-[#858EAD] hover:text-[#000000] dark:hover:text-[#FFFFFF] px-0 h-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Profile
                        </Button>
                    </Link>
                </div>
                <div className="flex flex-col items-start justify-start">
                    <h1 className="text-lg font-semibold">Edit Profile</h1>
                    <p className="text-[#5C5C7B] dark:text-[#858EAD]">Update your profile information</p>
                </div>
            </div>



            <div className="px-6 sm:px-12 pt-8">
                <div className="border border-[#cbcbcb] dark:border-[#212734] bg-[#fdfdfd] dark:bg-[#09090A] rounded-lg p-6">
                    <Profile clerkId={userId} user={JSON.stringify(userResult.user)} />
                </div>
            </div>
        </div>
    );
};
export default ProfileEdit;
