import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuestionById, getQuestions, editQuestion, deleteQuestion, createQuestion } from "../actions/questions";
import { GetQuestionsParams, EditQuestionParams, DeleteQuestionParams, CreateQuestionParams } from "../actions/shared.types";

export function useQuestionInfo(questionId: string) {
    return useQuery({
        queryKey: ["question", questionId],
        queryFn: () => getQuestionById({ questionId: parseInt(questionId) }),
        enabled: !!questionId && !isNaN(parseInt(questionId)),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}

export function useQuestions(params: GetQuestionsParams) {
    return useQuery({
        queryKey: ["questions", params.searchQuery, params.filter, params.page, params.pageSize],
        queryFn: () => getQuestions(params),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}

export function useCreateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: CreateQuestionParams) => createQuestion(params),
        onSuccess: () => {
            // Invalidate all questions queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
    });
}

export function useEditQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: EditQuestionParams) => editQuestion(params),
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["question", variables.questionId.toString()] });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
    });
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: DeleteQuestionParams) => deleteQuestion(params),
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["question", variables.questionId.toString()] });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
    });
} 