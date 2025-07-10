import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createLoop,
    editLoop,
    deleteLoop,
    joinLoop,
    leaveLoop,
    getLoopById,
    getAllLoops,
    getLoopQuestions,
    getUserLoops,
    getLoopMembers,
    getPopularLoops,
    askQuestionInLoop,
} from "@/lib/actions/loops";
import {
    CreateLoopParams,
    EditLoopParams,
    DeleteLoopParams,
    JoinLoopParams,
    LeaveLoopParams,
    GetLoopByIdParams,
    GetAllLoopsParams,
    GetLoopQuestionsParams,
    GetUserLoopsParams,
    GetLoopMembersParams,
    AskQuestionInLoopParams,
} from "@/lib/actions/shared.types";

// Create Loop
export const useCreateLoop = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: CreateLoopParams) => createLoop(params),
        onSuccess: (data) => {
            if (data.success) {
                // Invalidate loops list queries
                queryClient.invalidateQueries({ queryKey: ["loops"] });
                queryClient.invalidateQueries({ queryKey: ["user-loops"] });
            }
        },
    });
};

// Edit Loop
export const useEditLoop = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: EditLoopParams) => editLoop(params),
        onSuccess: (data, variables) => {
            if (data.success) {
                // Invalidate specific loop and loops list
                queryClient.invalidateQueries({ queryKey: ["loop", variables.loopId] });
                queryClient.invalidateQueries({ queryKey: ["loops"] });
            }
        },
    });
};

// Delete Loop
export const useDeleteLoop = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: DeleteLoopParams) => deleteLoop(params),
        onSuccess: (data, variables) => {
            if (data.success) {
                // Remove loop from cache and invalidate lists
                queryClient.removeQueries({ queryKey: ["loop", variables.loopId] });
                queryClient.invalidateQueries({ queryKey: ["loops"] });
                queryClient.invalidateQueries({ queryKey: ["user-loops"] });
            }
        },
    });
};

// Join Loop
export const useJoinLoop = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: JoinLoopParams) => joinLoop(params),
        onSuccess: (data, variables) => {
            if (data.success) {
                // Invalidate loop data and user's loops
                queryClient.invalidateQueries({ queryKey: ["loop", variables.loopId] });
                queryClient.invalidateQueries({ queryKey: ["user-loops"] });
            }
        },
    });
};

// Leave Loop
export const useLeaveLoop = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: LeaveLoopParams) => leaveLoop(params),
        onSuccess: (data, variables) => {
            if (data.success) {
                // Invalidate loop data and user's loops
                queryClient.invalidateQueries({ queryKey: ["loop", variables.loopId] });
                queryClient.invalidateQueries({ queryKey: ["user-loops"] });
            }
        },
    });
};

// Get Loop by ID
export const useGetLoopById = (params: GetLoopByIdParams) => {
    return useQuery({
        queryKey: ["loop", params.loopId],
        queryFn: () => getLoopById(params),
        enabled: !!params.loopId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
};

// Get All Loops
export const useGetAllLoops = (params: GetAllLoopsParams) => {
    return useQuery({
        queryKey: ["loops", params.searchQuery, params.filter, params.page, params.pageSize],
        queryFn: () => getAllLoops(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get Loop Questions
export const useGetLoopQuestions = (params: GetLoopQuestionsParams) => {
    return useQuery({
        queryKey: ["loop-questions", params.loopId, params.searchQuery, params.filter, params.page, params.pageSize],
        queryFn: () => getLoopQuestions(params),
        enabled: !!params.loopId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get User Loops
export const useGetUserLoops = (params: GetUserLoopsParams) => {
    return useQuery({
        queryKey: ["user-loops", params.userId, params.page, params.pageSize],
        queryFn: () => getUserLoops(params),
        enabled: !!params.userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
};

// Get Loop Members
export const useGetLoopMembers = (params: GetLoopMembersParams) => {
    return useQuery({
        queryKey: ["loop-members", params.loopId, params.page, params.pageSize],
        queryFn: () => getLoopMembers(params),
        enabled: !!params.loopId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
};

// Get Popular Loops
export const useGetPopularLoops = (limit?: number) => {
    return useQuery({
        queryKey: ["popular-loops", limit],
        queryFn: () => getPopularLoops(limit),
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
};

// Ask Question in Loop
export const useAskQuestionInLoop = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: AskQuestionInLoopParams) => askQuestionInLoop(params),
        onSuccess: (data, variables) => {
            if (data.success) {
                // Invalidate loop questions and related queries
                queryClient.invalidateQueries({ queryKey: ["loop-questions", variables.loopId] });
                queryClient.invalidateQueries({ queryKey: ["questions"] });
            }
        },
    });
};