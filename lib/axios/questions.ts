import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getQuestions,
    getQuestionById,
    createQuestion,
    editQuestion,
    deleteQuestion,
    upvoteQuestion,
    downvoteQuestion,
    getTopQuestions,
    getRecommendedQuestions
} from "../actions/questions";
import {
    GetQuestionsParams,
    GetQuestionByIdParams,
    CreateQuestionParams,
    EditQuestionParams,
    DeleteQuestionParams,
    QuestionVoteParams,
    RecommendedParams
} from "../actions/shared.types";

type QuestionVoteRow = {
    id: number;
    totalVotes: number;
    upvoteCount: number;
    downvoteCount: number;
};

function patchQuestionListUpvote(
    oldData: unknown,
    questionId: number,
    hasupVoted: boolean,
    hasdownVoted: boolean
): unknown {
    if (!oldData || typeof oldData !== "object") return oldData;

    const mapRow = (q: QuestionVoteRow): QuestionVoteRow => {
        if (q.id !== questionId) return q;
        let totalVotesChange = 0;
        if (hasupVoted) totalVotesChange = -1;
        else if (hasdownVoted) totalVotesChange = 2;
        else totalVotesChange = 1;
        return {
            ...q,
            totalVotes: q.totalVotes + totalVotesChange,
            upvoteCount: hasupVoted ? q.upvoteCount - 1 : q.upvoteCount + 1,
            downvoteCount: hasdownVoted ? q.downvoteCount - 1 : q.downvoteCount,
        };
    };

    if ("pages" in oldData && Array.isArray((oldData as { pages: unknown[] }).pages)) {
        const d = oldData as { pages: Array<{ questions?: QuestionVoteRow[] }>; pageParams: unknown[] };
        return {
            ...d,
            pages: d.pages.map((page) =>
                page.questions
                    ? { ...page, questions: page.questions.map(mapRow) }
                    : page
            ),
        };
    }

    if ("questions" in oldData && Array.isArray((oldData as { questions: QuestionVoteRow[] }).questions)) {
        const d = oldData as { questions: QuestionVoteRow[] };
        return { ...d, questions: d.questions.map(mapRow) };
    }

    return oldData;
}

function patchQuestionListDownvote(
    oldData: unknown,
    questionId: number,
    hasupVoted: boolean,
    hasdownVoted: boolean
): unknown {
    if (!oldData || typeof oldData !== "object") return oldData;

    const mapRow = (q: QuestionVoteRow): QuestionVoteRow => {
        if (q.id !== questionId) return q;
        let totalVotesChange = 0;
        if (hasdownVoted) totalVotesChange = 1;
        else if (hasupVoted) totalVotesChange = -2;
        else totalVotesChange = -1;
        return {
            ...q,
            totalVotes: q.totalVotes + totalVotesChange,
            upvoteCount: hasupVoted ? q.upvoteCount - 1 : q.upvoteCount,
            downvoteCount: hasdownVoted ? q.downvoteCount - 1 : q.downvoteCount + 1,
        };
    };

    if ("pages" in oldData && Array.isArray((oldData as { pages: unknown[] }).pages)) {
        const d = oldData as { pages: Array<{ questions?: QuestionVoteRow[] }>; pageParams: unknown[] };
        return {
            ...d,
            pages: d.pages.map((page) =>
                page.questions
                    ? { ...page, questions: page.questions.map(mapRow) }
                    : page
            ),
        };
    }

    if ("questions" in oldData && Array.isArray((oldData as { questions: QuestionVoteRow[] }).questions)) {
        const d = oldData as { questions: QuestionVoteRow[] };
        return { ...d, questions: d.questions.map(mapRow) };
    }

    return oldData;
}

function isListableQuestionsQuery(queryKey: readonly unknown[]) {
    return (
        queryKey[0] === "questions" &&
        queryKey[1] !== "top" &&
        queryKey[1] !== "recommended"
    );
}

// Vote status query
export function useQuestionVoteStatus(questionId: number, userId: number) {
    return useQuery({
        queryKey: ["question-vote", questionId, userId],
        queryFn: async () => {
            if (!userId || !questionId) return null;

            const response = await fetch('/api/check-vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, userId })
            });

            if (!response.ok) throw new Error('Failed to check vote status');

            const data = await response.json();
            // Ensure we always return a defined value (null instead of undefined)
            return data.vote || null;
        },
        enabled: !!userId && !!questionId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
}

// Optimistic voting mutations
export function useUpvoteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: QuestionVoteParams) => upvoteQuestion(params),
        onMutate: async (variables) => {
            const { questionId, userId, hasupVoted, hasdownVoted } = variables;

            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["question-vote", questionId, userId] });

            // Snapshot previous value
            const previousVote = queryClient.getQueryData(["question-vote", questionId, userId]);

            // Optimistically update vote status
            let newVote = null;
            if (hasupVoted) {
                // Remove upvote
                newVote = null;
            } else if (hasdownVoted) {
                // Change from downvote to upvote
                newVote = { type: "upvote", questionId, userId };
            } else {
                // Add upvote
                newVote = { type: "upvote", questionId, userId };
            }

            queryClient.setQueryData(["question-vote", questionId, userId], newVote);

            queryClient.setQueriesData(
                { predicate: (q) => isListableQuestionsQuery(q.queryKey) },
                (oldData: unknown) =>
                    patchQuestionListUpvote(oldData, questionId, hasupVoted, hasdownVoted)
            );

            return { previousVote };
        },
        onSuccess: (data, variables) => {
            if (variables.hasupVoted) {
                toast.success("Vote removed");
            } else {
                toast.success("Question upvoted!");
            }
        },
        onError: (err, variables, context) => {
            toast.error("An error occurred while upvoting.");
            // Rollback on error
            if (context?.previousVote !== undefined) {
                queryClient.setQueryData(
                    ["question-vote", variables.questionId, variables.userId],
                    context.previousVote
                );
            }
            // Invalidate to refetch correct data
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            queryClient.invalidateQueries({ queryKey: ["question", variables.questionId] });
        },
        onSettled: (data, error, variables) => {
            // Always refetch vote status and questions to ensure consistency
            queryClient.invalidateQueries({
                queryKey: ["question-vote", variables.questionId, variables.userId],
            });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            queryClient.invalidateQueries({ queryKey: ["question", variables.questionId] });
        },
    });
}

export function useDownvoteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: QuestionVoteParams) => downvoteQuestion(params),
        onMutate: async (variables) => {
            const { questionId, userId, hasupVoted, hasdownVoted } = variables;

            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["question-vote", questionId, userId] });

            // Snapshot previous value
            const previousVote = queryClient.getQueryData(["question-vote", questionId, userId]);

            // Optimistically update vote status
            let newVote = null;
            if (hasdownVoted) {
                // Remove downvote
                newVote = null;
            } else if (hasupVoted) {
                // Change from upvote to downvote
                newVote = { type: "downvote", questionId, userId };
            } else {
                // Add downvote
                newVote = { type: "downvote", questionId, userId };
            }

            queryClient.setQueryData(["question-vote", questionId, userId], newVote);

            queryClient.setQueriesData(
                { predicate: (q) => isListableQuestionsQuery(q.queryKey) },
                (oldData: unknown) =>
                    patchQuestionListDownvote(oldData, questionId, hasupVoted, hasdownVoted)
            );

            return { previousVote };
        },
        onSuccess: (data, variables) => {
            if (variables.hasdownVoted) {
                toast.success("Vote removed");
            } else {
                toast.success("Question downvoted");
            }
        },
        onError: (err, variables, context) => {
            toast.error("An error occurred while downvoting.");
            // Rollback on error
            if (context?.previousVote !== undefined) {
                queryClient.setQueryData(
                    ["question-vote", variables.questionId, variables.userId],
                    context.previousVote
                );
            }
            // Invalidate to refetch correct data
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            queryClient.invalidateQueries({ queryKey: ["question", variables.questionId] });
        },
        onSettled: (data, error, variables) => {
            // Always refetch vote status and questions to ensure consistency
            queryClient.invalidateQueries({
                queryKey: ["question-vote", variables.questionId, variables.userId],
            });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            queryClient.invalidateQueries({ queryKey: ["question", variables.questionId] });
        },
    });
}

// Other existing hooks
export function useQuestions(params: GetQuestionsParams) {
    return useQuery({
        queryKey: ["questions", params.searchQuery, params.filter, params.page, params.pageSize],
        queryFn: () => getQuestions(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useInfiniteQuestions(params: Omit<GetQuestionsParams, "page">) {
    return useInfiniteQuery({
        queryKey: ["questions", "infinite", params.searchQuery, params.filter, params.pageSize],
        queryFn: ({ pageParam }) =>
            getQuestions({ ...params, page: pageParam as number }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.isNext ? allPages.length + 1 : undefined,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
    });
}

export function useQuestionById(params: GetQuestionByIdParams) {
    return useQuery({
        queryKey: ["question", params.questionId, params.viewerUserId ?? null],
        queryFn: () => getQuestionById(params),
        enabled: !!params.questionId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useCreateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: CreateQuestionParams) => createQuestion(params),
        onSuccess: () => {
            toast.success("Question created successfully");
            // Invalidate questions list to show new question
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create question");
        },
    });
}

export function useEditQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: EditQuestionParams) => editQuestion(params),
        onSuccess: (data, variables) => {
            toast.success("Question edited successfully");
            // Invalidate specific question and questions list
            queryClient.invalidateQueries({ queryKey: ["question", variables.questionId] });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to edit question");
        },
    });
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: DeleteQuestionParams) => deleteQuestion(params),
        onSuccess: (data, variables) => {
            toast.success("Question deleted successfully");
            // Remove question from cache and invalidate lists
            queryClient.removeQueries({ queryKey: ["question", variables.questionId] });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete question");
        },
    });
}

export function useTopQuestions() {
    return useQuery({
        queryKey: ["questions", "top"],
        queryFn: getTopQuestions,
        staleTime: 1000 * 60 * 10, // 10 minutes for top questions
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useRecommendedQuestions(params: RecommendedParams) {
    return useQuery({
        queryKey: ["questions", "recommended", params.userId, params.page, params.pageSize],
        queryFn: () => getRecommendedQuestions(params),
        enabled: !!params.userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    });
}

