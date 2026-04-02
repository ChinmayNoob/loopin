"use client";

import { useQuery } from "@tanstack/react-query";
import { getModeratorDashboardStats } from "@/lib/actions/admin";
import Link from "next/link";

export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["admin-dashboard-stats"],
        queryFn: getModeratorDashboardStats,
    });

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-3xl font-bold text-dark100_light900">Admin</h1>
            <p className="mt-2 text-dark400_light700">
                Platform overview. Assign roles from your database or extend this page with user management UI.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-dark-400/20 p-4 dark:border-gray-700">
                    <p className="text-sm text-dark400_light700">Users</p>
                    <p className="text-2xl font-semibold">
                        {isLoading ? "…" : stats?.userCount ?? 0}
                    </p>
                </div>
                <div className="rounded-lg border border-dark-400/20 p-4 dark:border-gray-700">
                    <p className="text-sm text-dark400_light700">Questions</p>
                    <p className="text-2xl font-semibold">
                        {isLoading ? "…" : stats?.questionCount ?? 0}
                    </p>
                </div>
                <div className="rounded-lg border border-dark-400/20 p-4 dark:border-gray-700">
                    <p className="text-sm text-dark400_light700">Flagged (placeholder)</p>
                    <p className="text-2xl font-semibold">
                        {isLoading ? "…" : stats?.flaggedContentCount ?? 0}
                    </p>
                </div>
            </div>

            <div className="mt-10">
                <Link href="/" className="text-accent-blue underline">
                    Back to home
                </Link>
            </div>
        </div>
    );
}
