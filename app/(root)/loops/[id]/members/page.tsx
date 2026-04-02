"use client";

import Filter from "@/components/common/filter";
import Pagination from "@/components/common/pagination";
import { useGetLoopMembers, useGetLoopById, useGetLoopMemberRole, useAssignLoopRole, useKickLoopMember } from "@/lib/axios/loops";
import { useCurrentUser } from "@/lib/axios/users";
import Link from "next/link";
import React, { useState, use } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { getTimestamp } from "@/lib/utils";
import { Shield, Clock, ArrowLeft, ShieldCheck, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const MemberFilters = [
    { name: "All Members", value: "all" },
    { name: "Admins", value: "admin" },
    { name: "Moderators", value: "moderator" },
    { name: "Recent Joins", value: "recent" },
];

interface MemberCardProps {
    member: {
        id: number;
        clerkId: string;
        name: string;
        username: string;
        picture: string;
        reputation: number | null;
        role: string | null;
        joinedAt: Date;
    };
    loopId: number;
    canManageRoles: boolean;
    canKickMembers: boolean;
    viewerLoopRole: string | null;
    actorUserId: number;
}

const MemberCard = ({ member, loopId, canManageRoles, canKickMembers, viewerLoopRole, actorUserId }: MemberCardProps) => {
    const assignRole = useAssignLoopRole();
    const kickMember = useKickLoopMember();
    const pathname = usePathname();
    const isSelf = member.id === actorUserId;
    const targetRole = member.role ?? "member";
    const showKick =
        canKickMembers &&
        !isSelf &&
        (viewerLoopRole === "admin" || (viewerLoopRole === "moderator" && targetRole === "member"));

    const promoteModerator = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const res = await assignRole.mutateAsync({
            loopId,
            actorUserId,
            targetUserId: member.id,
            role: "moderator",
            path: `/loops/${loopId}/members`,
        });
        if (res.success) toast.success("Member promoted to moderator");
        else toast.error(res.error || "Could not update role");
    };

    const demoteToMember = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const res = await assignRole.mutateAsync({
            loopId,
            actorUserId,
            targetUserId: member.id,
            role: "member",
            path: `/loops/${loopId}/members`,
        });
        if (res.success) toast.success("Member role updated");
        else toast.error(res.error || "Could not update role");
    };

    const confirmKick = async () => {
        const res = await kickMember.mutateAsync({
            loopId,
            actorUserId,
            targetUserId: member.id,
            path: pathname || `/loops/${loopId}/members`,
        });
        if (res.success) toast.success("Member removed from loop");
        else toast.error(res.error || "Could not remove member");
    };

    return (
        <div className="relative">
            <Link href={`/profile/${member.clerkId}`} className="block">
                <div className="background-light850_dark100 light-border-2 flex min-h-[200px] w-full flex-col items-center justify-center rounded-sm border p-6 hover:bg-zinc-200/10 dark:hover:bg-zinc-900/60">
                    <div className="mb-3 size-[80px] overflow-hidden rounded-full">
                        <Image
                            src={member.picture || "/assets/icons/avatar.svg"}
                            alt="user profile picture"
                            className="size-full object-cover"
                            width={80}
                            height={80}
                        />
                    </div>
                    <div className="mt-2 text-center">
                        <h3 className="h3-bold text-dark200_light900 line-clamp-1">
                            {member.name}
                        </h3>
                        <p className="body-regular text-variant">@{member.username}</p>
                        <div className="mt-3 flex flex-col gap-2">
                            <div className="flex items-center justify-center gap-2 text-sm">
                                {member.role === "admin" ? (
                                    <div className="flex items-center gap-1 text-blue-500">
                                        <Shield size={14} />
                                        <span>Admin</span>
                                    </div>
                                ) : member.role === "moderator" ? (
                                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                        <ShieldCheck size={14} />
                                        <span>Moderator</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Clock size={14} />
                                        <span>Joined {getTimestamp(member.joinedAt)}</span>
                                    </div>
                                )}
                            </div>
                            {member.reputation !== null && (
                                <div className="text-sm text-dark400_light700">
                                    {member.reputation} Reputation
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
            {canManageRoles && !isSelf && member.role !== "admin" && (
                <div className="mt-2 flex flex-wrap justify-center gap-2 px-1">
                    {member.role !== "moderator" ? (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            disabled={assignRole.isPending}
                            onClick={promoteModerator}
                        >
                            Make moderator
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            disabled={assignRole.isPending}
                            onClick={demoteToMember}
                        >
                            Remove moderator
                        </Button>
                    )}
                </div>
            )}
            {showKick && (
                <div className="mt-2 flex justify-center px-1">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-xs border-red-500/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                disabled={kickMember.isPending}
                            >
                                <UserMinus className="mr-1 size-3.5" />
                                Remove from loop
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    They will lose access to this loop and its posts until they join again.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={kickMember.isPending}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    disabled={kickMember.isPending}
                                    className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                    onClick={() => {
                                        void confirmKick();
                                    }}
                                >
                                    {kickMember.isPending ? "Removing…" : "Remove"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    );
};

interface PageParams {
    id: string;
}

const LoopMembers = ({ params }: { params: Promise<PageParams> }) => {
    const router = useRouter();
    const unwrappedParams = use(params);
    const loopId = parseInt(unwrappedParams.id);
    const [filter, setFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    const { data: currentUser } = useCurrentUser();
    const viewerId = currentUser?.user?.id;

    const { data: loopInfo } = useGetLoopById({ loopId });
    const { data: viewerMembership } = useGetLoopMemberRole(
        viewerId ? { loopId, userId: viewerId } : null
    );

    const { data: result, isLoading, error } = useGetLoopMembers({
        loopId,
        page: currentPage,
        pageSize: 9,
        filter: filter as "all" | "admin" | "moderator" | "recent",
    });

    const viewerLoopRole = viewerMembership?.success === true ? viewerMembership.role ?? null : null;
    const canManageRoles = viewerLoopRole === "admin";
    const canKickMembers = viewerLoopRole === "admin" || viewerLoopRole === "moderator";

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (isLoading) {
        return (
            <div className="px-6 sm:px-12">
                <div className="flex items-center mt-5">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
                        <ArrowLeft className="size-5" />
                    </Button>
                    <h1 className="h1-bold text-dark100_light900">Loop Members</h1>
                </div>
                <div className="mt-5 flex items-center justify-center">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !loopInfo) {
        return (
            <div className="px-6 sm:px-12">
                <div className="flex items-center mt-5">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
                        <ArrowLeft className="size-5" />
                    </Button>
                    <h1 className="h1-bold text-dark100_light900">Loop Members</h1>
                </div>
                <div className="mt-5 flex items-center justify-center">
                    <p className="paragraph-regular text-red-500">Error loading members. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 sm:px-12">
            <div className="flex items-center justify-between mt-5">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
                        <ArrowLeft className="size-5" />
                    </Button>
                    <h1 className="h1-bold text-dark100_light900">
                        {loopInfo.name} - Members ({loopInfo.memberCount})
                    </h1>
                </div>
                <Filter
                    filters={MemberFilters}
                    otherClasses="h-[30px]"
                    containerClasses="flex"
                    placeholder="Select a filter"
                    value={filter}
                    onValueChange={handleFilterChange}
                />
            </div>

            <section className="mt-8 grid w-full grid-cols-2 gap-3 max-sm:gap-1 md:grid-cols-3">
                {result && result.members.length > 0 ? (
                    result.members.map((member) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            loopId={loopId}
                            canManageRoles={!!canManageRoles && !!viewerId}
                            canKickMembers={!!canKickMembers && !!viewerId}
                            viewerLoopRole={viewerLoopRole}
                            actorUserId={viewerId ?? 0}
                        />
                    ))
                ) : (
                    <div className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center col-span-full">
                        <p>No members found</p>
                        <Link href={`/loops/${loopId}`} className="mt-2 font-bold text-accent-blue">
                            Join to be the first!
                        </Link>
                    </div>
                )}
            </section>

            {result && (
                <div className="mt-10">
                    <Pagination
                        pageNumber={currentPage}
                        isNext={result.isNext}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default LoopMembers;
