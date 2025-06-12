"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createUser,
    getUserById,
    getUserByClerkId,
    updateUserById,
    deleteUserById,
    createOrGetUserFromClerk,
    updateUser,
    getUserInfo,
    ensureUserExists,
    type NewUser,
    type User,
} from '@/lib/actions/users';

// Query Keys
export const userQueryKeys = {
    all: ['users'] as const,
    byId: (id: number) => [...userQueryKeys.all, 'byId', id] as const,
    byClerkId: (clerkId: string) => [...userQueryKeys.all, 'byClerkId', clerkId] as const,
    info: (userId: string) => [...userQueryKeys.all, 'info', userId] as const,
    profile: (clerkId: string) => [...userQueryKeys.all, 'profile', clerkId] as const,
    current: () => [...userQueryKeys.all, 'current'] as const,
} as const;

// Query hooks for fetching data

export const useGetUserById = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: userQueryKeys.byId(id),
        queryFn: () => getUserById(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
            // Don't retry if user not found
            if (error && typeof error === 'object' && 'error' in error && error.error === 'User not found') {
                return false;
            }
            return failureCount < 3;
        },
    });
};

export const useGetUserByClerkId = (clerkId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: userQueryKeys.byClerkId(clerkId),
        queryFn: () => getUserByClerkId(clerkId),
        enabled: enabled && !!clerkId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
            // Don't retry if user not found
            if (error && typeof error === 'object' && 'error' in error && error.error === 'User not found') {
                return false;
            }
            return failureCount < 3;
        },
    });
};

export const useGetUserInfo = (userId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: userQueryKeys.info(userId),
        queryFn: () => getUserInfo({ userId }),
        enabled: enabled && !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: (failureCount, error) => {
            if (error && typeof error === 'object' && 'message' in error && error.message === 'User not found') {
                return false;
            }
            return failureCount < 3;
        },
    });
};

export const useCreateOrGetUserFromClerk = (enabled: boolean = true) => {
    return useQuery({
        queryKey: userQueryKeys.current(),
        queryFn: () => createOrGetUserFromClerk(),
        enabled,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
    });
};

// Mutation hooks for data modifications

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: NewUser) => createUser(userData),
        onSuccess: (data) => {
            if (data.success && data.user) {
                // Invalidate and refetch users
                queryClient.invalidateQueries({ queryKey: userQueryKeys.all });

                // Set the new user in cache
                queryClient.setQueryData(
                    userQueryKeys.byId(data.user.id),
                    data
                );

                if (data.user.clerkId) {
                    queryClient.setQueryData(
                        userQueryKeys.byClerkId(data.user.clerkId),
                        data
                    );
                }
            }
        },
        onError: (error) => {
            console.error('Error creating user:', error);
        },
    });
};

export const useUpdateUserById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updateData }: {
            id: number;
            updateData: Partial<Omit<NewUser, 'id' | 'clerkId'>>
        }) => updateUserById(id, updateData),
        onSuccess: (data, variables) => {
            if (data.success && data.user) {
                // Update the user in cache
                queryClient.setQueryData(
                    userQueryKeys.byId(variables.id),
                    data
                );

                if (data.user.clerkId) {
                    queryClient.setQueryData(
                        userQueryKeys.byClerkId(data.user.clerkId),
                        data
                    );

                    // Invalidate user info cache
                    queryClient.invalidateQueries({
                        queryKey: userQueryKeys.info(data.user.clerkId)
                    });
                }

                // Invalidate all users list
                queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
            }
        },
        onError: (error) => {
            console.error('Error updating user:', error);
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            clerkId,
            updateData,
            path,
        }: {
            clerkId: string;
            updateData: {
                name?: string;
                username?: string;
                leetcodeProfile?: string;
                location?: string;
                bio?: string;
            };
            path: string;
        }) => updateUser({ clerkId, updateData, path }),
        onSuccess: (data, variables) => {
            if (data.success && data.user) {
                // Update caches
                queryClient.setQueryData(
                    userQueryKeys.byClerkId(variables.clerkId),
                    data
                );

                queryClient.setQueryData(
                    userQueryKeys.byId(data.user.id),
                    data
                );

                // Invalidate user info
                queryClient.invalidateQueries({
                    queryKey: userQueryKeys.info(variables.clerkId)
                });

                // Invalidate all users
                queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
            }
        },
        onError: (error) => {
            console.error('Error updating user:', error);
        },
    });
};

export const useDeleteUserById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteUserById(id),
        onSuccess: (data, variables) => {
            if (data.success && data.user) {
                // Remove user from cache
                queryClient.removeQueries({
                    queryKey: userQueryKeys.byId(variables)
                });

                if (data.user.clerkId) {
                    queryClient.removeQueries({
                        queryKey: userQueryKeys.byClerkId(data.user.clerkId)
                    });

                    queryClient.removeQueries({
                        queryKey: userQueryKeys.info(data.user.clerkId)
                    });
                }

                // Invalidate all users list
                queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
            }
        },
        onError: (error) => {
            console.error('Error deleting user:', error);
        },
    });
};

export const useEnsureUserExists = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (clerkId: string) => ensureUserExists(clerkId),
        onSuccess: (data, variables) => {
            if (data.success && data.user) {
                // Set user in cache
                queryClient.setQueryData(
                    userQueryKeys.byClerkId(variables),
                    data
                );

                queryClient.setQueryData(
                    userQueryKeys.byId(data.user.id),
                    data
                );

                // Invalidate user info to refetch
                queryClient.invalidateQueries({
                    queryKey: userQueryKeys.info(variables)
                });
            }
        },
        onError: (error) => {
            console.error('Error ensuring user exists:', error);
        },
    });
};

// Helper hook to prefetch user data
export const usePrefetchUser = () => {
    const queryClient = useQueryClient();

    const prefetchUserById = (id: number) => {
        queryClient.prefetchQuery({
            queryKey: userQueryKeys.byId(id),
            queryFn: () => getUserById(id),
            staleTime: 5 * 60 * 1000,
        });
    };

    const prefetchUserByClerkId = (clerkId: string) => {
        queryClient.prefetchQuery({
            queryKey: userQueryKeys.byClerkId(clerkId),
            queryFn: () => getUserByClerkId(clerkId),
            staleTime: 5 * 60 * 1000,
        });
    };

    const prefetchUserInfo = (userId: string) => {
        queryClient.prefetchQuery({
            queryKey: userQueryKeys.info(userId),
            queryFn: () => getUserInfo({ userId }),
            staleTime: 2 * 60 * 1000,
        });
    };

    return {
        prefetchUserById,
        prefetchUserByClerkId,
        prefetchUserInfo,
    };
};

// Utility functions for cache management
export const userCacheUtils = {
    invalidateAll: (queryClient: any) => {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },

    invalidateUserById: (queryClient: any, id: number) => {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.byId(id) });
    },

    invalidateUserByClerkId: (queryClient: any, clerkId: string) => {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.byClerkId(clerkId) });
    },

    removeUserFromCache: (queryClient: any, id: number, clerkId?: string) => {
        queryClient.removeQueries({ queryKey: userQueryKeys.byId(id) });
        if (clerkId) {
            queryClient.removeQueries({ queryKey: userQueryKeys.byClerkId(clerkId) });
            queryClient.removeQueries({ queryKey: userQueryKeys.info(clerkId) });
        }
    },
}; 