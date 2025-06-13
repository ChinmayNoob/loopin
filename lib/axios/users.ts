import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserInfo, getUserByClerkId, updateUser } from "../actions/users";
import { useAuth } from "@clerk/nextjs";

export function useUserInfo(userId: string) {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: () => getUserInfo({ userId }),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}

export function useUserByClerkId(clerkId: string) {
    return useQuery({
        queryKey: ["user", "clerk", clerkId],
        queryFn: () => getUserByClerkId(clerkId),
        enabled: !!clerkId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}

export function useCurrentUser() {
    const { userId } = useAuth();
    return useUserByClerkId(userId || '');
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ clerkId, updateData, path }: {
            clerkId: string;
            updateData: {
                name: string;
                username: string;
                leetcodeProfile?: string;
                location: string;
                bio: string;
            };
            path: string;
        }) => {
            return updateUser({ clerkId, updateData, path });
        },
        onSuccess: (_, variables) => {
            // Invalidate all user-related queries
            queryClient.invalidateQueries({ queryKey: ["user"] });
            // Specifically invalidate the clerk user query
            queryClient.invalidateQueries({ queryKey: ["user", "clerk", variables.clerkId] });
        },
    });
}
