
import { BADGE_CRITERIA } from "@/constants";
import { LoopWithStats, QuestionWithAuthor } from "@/lib/actions/shared.types";
import { IconType } from 'react-icons';

export interface SidebarLink {
    imgURL?: string;
    icon?: IconType;
    route: string;
    label: string;
    classname: string;
}

export interface Job {
    id?: string;
    employer_name?: string;
    employer_logo?: string | undefined;
    employer_website?: string;
    job_employment_type?: string;
    job_title?: string;
    job_description?: string;
    job_apply_link?: string;
    job_city?: string;
    job_state?: string;
    job_country?: string;
}

export interface Country {
    name: {
        common: string;
    };
}

export interface ParamsProps {
    params: { id: string };
}

export interface SearchParamsProps {
    searchParams: { [key: string]: string | undefined };
}

export interface URLProps {
    params: { id: string };
    searchParams: { [key: string]: string | undefined };
}

export interface BadgeCounts {
    GOLD: number;
    SILVER: number;
    BRONZE: number;
}

export interface UrlQueryParams {
    params: string;
    key: string;
    value: string | null;
}

export interface removeUrlQueryParams {
    params: string;
    keysToRemove: string[];
}

export interface IBadgeParams {
    criteria: {
        type: keyof typeof BADGE_CRITERIA;
        count: number;
    }[];
}

export type BadgeCriteriaType = keyof typeof BADGE_CRITERIA;

export interface VoteStatus {
    questionId?: number;
    answerId?: number;
    type?: 'upvote' | 'downvote';
    hasVote: boolean;
}


export interface ProfileProps {
    clerkId: string;
    user: string;
}
export interface ProfileLinkProps {
    imgUrl: string;
    title: string;
    href?: string;
}

export interface ProfileTabsProps {
    clerkId: string;
    isOwnProfile: boolean;
}


//loops types


export interface JoinLeaveButtonProps {
    loopId: number;
    userId: number;
    isMember: boolean;
}

export interface LoopsListProps {
    loops: LoopWithStats[];
    isNext: boolean;
    searchQuery: string;
    filter: "newest" | "popular" | "active";
    page: number;
}

export interface LoopCardProps {
    loop: LoopWithStats;
}

export interface LoopQuestionsListProps {
    questions: QuestionWithAuthor[];
    isNext: boolean;
    loopId: number;
    searchQuery: string;
    filter: "newest" | "frequent" | "unanswered";
    page: number;
    userClerkId: string | null;
}