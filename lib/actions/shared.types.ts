import { questions, answers, users, tags, loops, loopMembers } from "@/db/schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Question Types
export type Question = InferSelectModel<typeof questions>;
export type NewQuestion = InferInsertModel<typeof questions>;

// Question with Author information
export interface QuestionWithAuthor {
    id: number;
    title: string;
    content: string;
    views: number | null;
    authorId: number;
    loopId: number | null;
    createdAt: Date;
    upvoteCount: number;
    downvoteCount: number;
    totalVotes: number;
    answerCount: number;
    tags: Array<{ id: number; name: string; description: string }>;
    author: {
        id: number | null;
        clerkId: string | null;
        name: string | null;
        username: string | null;
        email: string | null;
        picture: string | null;
        reputation: number | null;
        leetcodeProfile: string | null;
    } | null;
    loop?: {
        id: number;
        name: string;
        slug: string;
        description: string;
        picture: string;
        createdOn: Date;
    } | null;
}

export interface GetQuestionsParams {
    searchQuery?: string;
    filter?: "newest" | "frequent" | "unanswered";
    page?: number;
    pageSize?: number;
}

export interface CreateQuestionParams {
    title: string;
    content: string;
    tags: string[];
    authorId: number;
    path: string;
}

export interface GetQuestionByIdParams {
    questionId: number;
}

export interface QuestionVoteParams {
    questionId: number;
    userId: number;
    hasupVoted: boolean;
    hasdownVoted: boolean;
    path: string;
}

export interface DeleteQuestionParams {
    questionId: number;
    userId: number;
    path: string;
}

export interface EditQuestionParams {
    questionId: number;
    title: string;
    content: string;
    tags?: string[];
    userId: number;
    path: string;
}

export interface RecommendedParams {
    userId: number;
    page?: number;
    pageSize?: number;
    searchQuery?: string;
}

// Answer Types
export type Answer = InferSelectModel<typeof answers>;
export type NewAnswer = InferInsertModel<typeof answers>;

export interface CreateAnswerParams {
    content: string;
    authorId: number;
    questionId: number;
    path: string;
}

export interface GetAnswersParams {
    questionId: number;
    sortBy?: string;
    page?: number;
    pageSize?: number;
}

export interface AnswerVoteParams {
    answerId: number;
    userId: number;
    hasupVoted: boolean;
    hasdownVoted: boolean;
    path: string;
}

export interface DeleteAnswerParams {
    answerId: number;
    path: string;
}

// User Types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export interface CreateUserParams {
    clerkId: string;
    name: string;
    username: string;
    email: string;
    picture: string;
}

export interface GetUserByIdParams {
    userId: number;
}

export interface GetAllUsersParams {
    page?: number;
    pageSize?: number;
    filter?: string;
    searchQuery?: string;
}

export interface UpdateUserParams {
    userId: number;
    updateData: Partial<Omit<NewUser, "id" | "clerkId">>;
    path: string;
}

// Tag Types
export type Tag = InferSelectModel<typeof tags>;
export type NewTag = InferInsertModel<typeof tags>;

export interface GetAllTagsParams {
    page?: number;
    pageSize?: number;
    filter?: string;
    searchQuery?: string;
}

export interface GetQuestionsByTagIdParams {
    tagId: number;
    page?: number;
    pageSize?: number;
    searchQuery?: string;
}

export interface GetTopInteractedTagsParams {
    userId: number;
    limit?: number;
}

// Saved Questions Types
export interface ToggleSaveQuestionParams {
    userId: string; // clerkId
    questionId: number;
    path: string;
}

export interface GetSavedQuestionsParams {
    clerkId: string;
    page?: number;
    pageSize?: number;
    filter?: string;
    searchQuery?: string;
}

export interface GetUserStatsParams {
    clerkId: string;
    page?: number;
    pageSize?: number;
}

export interface DeleteUserParams {
    userId: number;
}

// Interaction Types
export interface ViewQuestionParams {
    questionId: number;
    userId?: number;
}

// loop types 

export type Loop = InferSelectModel<typeof loops>;
export type NewLoop = InferInsertModel<typeof loops>;
export type LoopMember = InferSelectModel<typeof loopMembers>;
export type NewLoopMember = InferInsertModel<typeof loopMembers>;

export interface LoopWithStats {
    id: number;
    name: string;
    slug: string;
    description: string;
    picture: string;
    createdAt: Date;
    memberCount: number;
    questionCount: number;
}

export interface LoopWithMembership extends LoopWithStats {
    role: string;
    joinedAt: Date;
}

export interface CreateLoopParams {
    name: string;
    slug: string;
    description: string;
    picture: string;
    creatorId: number;
    path: string;
}

export interface EditLoopParams {
    loopId: number;
    name?: string;
    description?: string;
    picture?: string;
    userId: number;
    path: string;
}

export interface DeleteLoopParams {
    loopId: number;
    userId: number;
    path: string;
}

export interface JoinLoopParams {
    loopId: number;
    userId: number;
    path: string;
}

export interface LeaveLoopParams {
    loopId: number;
    userId: number;
    path: string;
}

export interface GetLoopByIdParams {
    loopId: number;
}

export interface GetAllLoopsParams {
    searchQuery?: string;
    filter?: "newest" | "popular" | "active";
    page?: number;
    pageSize?: number;
}

export interface GetLoopQuestionsParams {
    loopId: number;
    searchQuery?: string;
    filter?: "newest" | "frequent" | "unanswered";
    page?: number;
    pageSize?: number;
}

export interface GetUserLoopsParams {
    userId: number;
    page?: number;
    pageSize?: number;
}

export interface AskQuestionInLoopParams {
    title: string;
    content: string;
    tags: string[];
    loopId?: number;
    authorId: number;
    path: string;
}

export interface GetLoopMembersParams {
    loopId: number;
    page?: number;
    pageSize?: number;
    filter?: "all" | "admin" | "recent";
}

export interface LoopMemberWithUser {
    id: number;
    clerkId: string;
    name: string;
    username: string;
    picture: string;
    reputation: number;
    role: string;
    joinedAt: Date;
}