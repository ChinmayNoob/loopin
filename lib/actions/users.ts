"use server";


import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { users } from "@/db/schema";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Create a new user
export async function createUser(userData: NewUser) {
    try {
        const [newUser] = await db.insert(users).values(userData).returning();
        return { success: true, user: newUser };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: "Failed to create user" };
    }
}

// Get user by ID
export async function getUserById(id: number) {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, id)
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        return { success: true, user };
    } catch (error) {
        console.error("Error fetching user:", error);
        return { success: false, error: "Failed to fetch user" };
    }
}

// Get user by Clerk ID
export async function getUserByClerkId(clerkId: string) {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, clerkId)
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        return { success: true, user };
    } catch (error) {
        console.error("Error fetching user:", error);
        return { success: false, error: "Failed to fetch user" };
    }
}

// Update user by ID
export async function updateUserById(id: number, updateData: Partial<Omit<NewUser, 'id' | 'clerkId'>>) {
    try {
        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning();

        if (!updatedUser) {
            return { success: false, error: "User not found" };
        }

        return { success: true, user: updatedUser };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Failed to update user" };
    }
}

// Delete user by ID
export async function deleteUserById(id: number) {
    try {
        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning();

        if (!deletedUser) {
            return { success: false, error: "User not found" };
        }

        return { success: true, user: deletedUser };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}

// Create or get user from Clerk data (for automatic user creation on login)
export async function createOrGetUserFromClerk() {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return { success: false, error: "No authenticated user found" };
        }

        // Try to get existing user first
        const existingUser = await getUserByClerkId(clerkUser.id);

        if (existingUser.success) {
            return existingUser;
        }

        // If user doesn't exist, create new user from Clerk data
        const newUserData: NewUser = {
            clerkId: clerkUser.id,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'Unknown',
            username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || 'user',
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            picture: clerkUser.imageUrl || '',
            bio: null,
            location: null,
            leetcodeProfile: null,
            password: null, // Not needed for Clerk users
        };

        return await createUser(newUserData);
    } catch (error) {
        console.error("Error creating/getting user from Clerk:", error);
        return { success: false, error: "Failed to create/get user" };
    }
}

// Update user by Clerk ID - for profile updates
export async function updateUser({
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
}) {
    try {
        // First get the user by clerkId to get their numeric ID
        const userResult = await getUserByClerkId(clerkId);

        if (!userResult.success) {
            throw new Error("User not found");
        }

        // Update the user using their numeric ID
        const result = await updateUserById(userResult.user!.id, updateData);

        if (!result.success) {
            throw new Error(result.error || "Failed to update user");
        }

        // Revalidate the path to refresh the data
        revalidatePath(path);

        return result;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

// Get user info by userId (clerkId) - simplified version
export async function getUserInfo(params: { userId: string }) {
    try {
        const { userId } = params;

        // First, ensure the user exists in our database
        await ensureUserExists(userId);

        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, userId)
        });

        if (!user) {
            throw new Error("User not found");
        }

        // For now, just return basic user info with placeholder values
        // TODO: Add questions and answers functionality later
        const totalQuestions = 0;
        const totalAnswers = 0;
        const badgeCounts = {
            GOLD: 0,
            SILVER: 0,
            BRONZE: 0
        };

        return {
            user,
            totalQuestions,
            totalAnswers,
            reputation: user.reputation || 0,
            badgeCounts
        };
    } catch (error) {
        console.error("Error fetching user info:", error);
        throw error;
    }
}

// Helper function to ensure user exists in database
export async function ensureUserExists(clerkId: string) {
    try {
        // Check if user already exists
        const existingUser = await getUserByClerkId(clerkId);

        if (existingUser.success) {
            return existingUser;
        }

        // If user doesn't exist, create them
        console.log("User not found in database, creating from Clerk data...");
        const result = await createOrGetUserFromClerk();

        if (!result.success) {
            console.error("Failed to create user:", result.error);
        }

        return result;
    } catch (error) {
        console.error("Error ensuring user exists:", error);
        return { success: false, error: "Failed to ensure user exists" };
    }
} 