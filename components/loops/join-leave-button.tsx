"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader } from "lucide-react";
import { joinLoop, leaveLoop } from "@/lib/actions/loops";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

interface JoinLeaveButtonProps {
    loopId: number;
    userId: number;
    isMember: boolean;
}

const JoinLeaveButton = ({ loopId, userId, isMember }: JoinLeaveButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleJoinLoop = async () => {
        setIsLoading(true);
        try {
            const result = await joinLoop({
                loopId,
                userId,
                path: pathname,
            });

            if (result.success) {
                toast.success("Successfully joined the community!");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to join community");
            }
        } catch (error) {
            console.error("Error joining loop:", error);
            toast.error("Failed to join community");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveLoop = async () => {
        setIsLoading(true);
        try {
            const result = await leaveLoop({
                loopId,
                userId,
                path: pathname,
            });

            if (result.success) {
                toast.success("Successfully left the community!");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to leave community");
            }
        } catch (error) {
            console.error("Error leaving loop:", error);
            toast.error("Failed to leave community");
        } finally {
            setIsLoading(false);
        }
    };

    if (isMember) {
        return (
            <Button
                variant="outline"
                onClick={handleLeaveLoop}
                disabled={isLoading}
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20"
            >
                {isLoading ? (
                    <Loader size={16} className="animate-spin" />
                ) : (
                    <UserMinus size={16} />
                )}
                {isLoading ? "Leaving..." : "Leave"}
            </Button>
        );
    }

    return (
        <Button
            onClick={handleJoinLoop}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
            {isLoading ? (
                <Loader size={16} className="animate-spin" />
            ) : (
                <UserPlus size={16} />
            )}
            {isLoading ? "Joining..." : "Join"}
        </Button>
    );
};

export default JoinLeaveButton;