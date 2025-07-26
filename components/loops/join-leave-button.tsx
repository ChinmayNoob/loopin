"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader } from "lucide-react";
import { useJoinLoop, useLeaveLoop } from "@/lib/axios/loops";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { JoinLeaveButtonProps } from "@/types";

const JoinLeaveButton = ({ loopId, userId, isMember }: JoinLeaveButtonProps) => {
    const pathname = usePathname();

    const joinMutation = useJoinLoop();
    const leaveMutation = useLeaveLoop();

    const isLoading = joinMutation.isPending || leaveMutation.isPending;

    const handleJoinLoop = async () => {
        try {
            const result = await joinMutation.mutateAsync({
                loopId,
                userId,
                path: pathname,
            });

            if (!result.success) {
                toast.error(result.error || "Failed to join community");
            } else {
                toast.success("Successfully joined the community!");
            }
        } catch (error) {
            console.error("Error joining loop:", error);
            toast.error("Failed to join community");
        }
    };

    const handleLeaveLoop = async () => {
        try {
            const result = await leaveMutation.mutateAsync({
                loopId,
                userId,
                path: pathname,
            });

            if (!result.success) {
                toast.error(result.error || "Failed to leave community");
            } else {
                toast.success("Successfully left the community!");
            }
        } catch (error) {
            console.error("Error leaving loop:", error);
            toast.error("Failed to leave community");
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