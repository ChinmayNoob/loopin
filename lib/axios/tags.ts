import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
    getAllTags,
    getQuestionsByTagId,
    getTopInteractedTags,
    getTopPopularTags
} from "../actions/tags";
import {
    GetAllTagsParams,
    GetQuestionsByTagIdParams,
    GetTopInteractedTagsParams
} from "../actions/shared.types";

export function useAllTags(params: GetAllTagsParams) {
    return useQuery({
        queryKey: ["tags", params.searchQuery, params.filter, params.page, params.pageSize],
        queryFn: () => getAllTags(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useQuestionsByTagId(params: GetQuestionsByTagIdParams) {
    return useQuery({
        queryKey: ["questionsByTag", params.tagId, params.searchQuery, params.page, params.pageSize],
        queryFn: () => getQuestionsByTagId(params),
        enabled: !!params.tagId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useInfiniteQuestionsByTagId(params: Omit<GetQuestionsByTagIdParams, "page">) {
    return useInfiniteQuery({
        queryKey: ["questionsByTag", "infinite", params.tagId, params.searchQuery, params.pageSize],
        queryFn: ({ pageParam }) =>
            getQuestionsByTagId({ ...params, page: pageParam as number }),
        enabled: !!params.tagId,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.isNext ? allPages.length + 1 : undefined,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}

export function useTopInteractedTags(params: GetTopInteractedTagsParams) {
    return useQuery({
        queryKey: ["topInteractedTags", params.userId, params.limit],
        queryFn: () => getTopInteractedTags(params),
        enabled: !!params.userId,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 20, // 20 minutes
    });
}

export function useTopPopularTags() {
    return useQuery({
        queryKey: ["topPopularTags"],
        queryFn: () => getTopPopularTags(),
        staleTime: 1000 * 60 * 15, // 15 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
} 