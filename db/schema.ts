import { index, pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

// Users table — global roles: "user" | "moderator" | "admin"
export const users = pgTable(
    "users",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        clerkId: t.varchar("clerk_id").notNull(),
        name: t.varchar().notNull(),
        username: t.varchar().notNull().unique(),
        email: t.varchar().notNull().unique(),
        password: t.varchar(),
        bio: t.text(),
        picture: t.varchar().notNull(),
        location: t.varchar(),
        leetcodeProfile: t.varchar("leetcode_profile"),
        reputation: t.integer().default(0),
        /** Platform role for RBAC */
        role: t.varchar().default("user").notNull(),
        joinedAt: t.timestamp("joined_at").defaultNow().notNull(),
    },
    (table) => [
        index("idx_users_role").on(table.role),
    ]
);

// Tags table
export const tags = pgTable(
    "tags",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        name: t.varchar().notNull(),
        description: t.text().notNull(),
        createdOn: t.timestamp("created_on").defaultNow().notNull(),
    },
    (table) => [index("idx_tags_name").on(table.name)]
);

export const loops = pgTable(
    "loops",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        name: t.varchar().notNull().unique(),
        slug: t.varchar().notNull().unique(),
        description: t.text().notNull(),
        picture: t.varchar().notNull(),
        createdOn: t.timestamp("created_on").defaultNow().notNull(),
    }
);

// Questions table
export const questions = pgTable(
    "questions",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        title: t.varchar().notNull(),
        content: t.text().notNull(),
        views: t.integer().default(0),
        authorId: t.integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        loopId: t.integer("loop_id").references(() => loops.id, { onDelete: "cascade" }),
        createdAt: t.timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("idx_questions_author_id").on(table.authorId),
        index("idx_questions_loop_id").on(table.loopId),
        index("idx_questions_created_at").on(table.createdAt),
        index("idx_questions_views").on(table.views),
    ]
);

// Question-Tag relations
export const questionTags = pgTable(
    "question_tags",
    {
        questionId: t.integer("question_id").references(() => questions.id, { onDelete: "cascade" }).notNull(),
        tagId: t.integer("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
    },
    (table) => [
        index("idx_qt_question_id").on(table.questionId),
        index("idx_qt_tag_id").on(table.tagId),
    ]
);

// Answers table
export const answers = pgTable(
    "answers",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        content: t.text().notNull(),
        authorId: t.integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        questionId: t.integer("question_id").references(() => questions.id, { onDelete: "cascade" }).notNull(),
        createdAt: t.timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("idx_answers_question_id").on(table.questionId),
        index("idx_answers_author_id").on(table.authorId),
    ]
);

// Votes table (for both questions and answers)
export const votes = pgTable(
    "votes",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        userId: t.integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        questionId: t.integer("question_id").references(() => questions.id, { onDelete: "cascade" }),
        answerId: t.integer("answer_id").references(() => answers.id, { onDelete: "cascade" }),
        type: t.varchar().notNull(), // 'upvote' or 'downvote'
        createdAt: t.timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("idx_votes_question_user").on(table.questionId, table.userId),
        index("idx_votes_answer_user").on(table.answerId, table.userId),
    ]
);

// Saved questions
export const savedQuestions = pgTable(
    "saved_questions",
    {
        userId: t.integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        questionId: t.integer("question_id").references(() => questions.id, { onDelete: "cascade" }).notNull(),
        savedAt: t.timestamp("saved_at").defaultNow().notNull(),
    },
    (table) => [index("idx_saved_user_id").on(table.userId)]
);

// Tag followers
export const tagFollowers = pgTable(
    "tag_followers",
    {
        userId: t.integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        tagId: t.integer("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
        followedAt: t.timestamp("followed_at").defaultNow().notNull(),
    }
);

// Interactions table
export const interactions = pgTable(
    "interactions",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        userId: t.integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        action: t.varchar().notNull(),
        questionId: t.integer("question_id").references(() => questions.id, { onDelete: "cascade" }),
        answerId: t.integer("answer_id").references(() => answers.id, { onDelete: "cascade" }),
        tagId: t.integer("tag_id").references(() => tags.id, { onDelete: "cascade" }),
        createdAt: t.timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [index("idx_interactions_user_id").on(table.userId)]
);

export const loopMembers = pgTable(
    "loop_members",
    {
        loopId: t.integer("loop_id").references(() => loops.id, { onDelete: "cascade" }).notNull(),
        userId: t.integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        /** "member" | "moderator" | "admin" */
        role: t.varchar().default("member"),
        joinedAt: t.timestamp("joined_at").defaultNow().notNull(),
    },
    (table) => [
        index("idx_lm_loop_user").on(table.loopId, table.userId),
        index("idx_lm_loop_role").on(table.loopId, table.role),
    ]
);
