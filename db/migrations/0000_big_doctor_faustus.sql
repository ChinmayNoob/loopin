CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clerk_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"username" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar,
	"bio" text,
	"picture" varchar NOT NULL,
	"location" varchar,
	"leetcode_profile" varchar,
	"reputation" integer DEFAULT 0,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
