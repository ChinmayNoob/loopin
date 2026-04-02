CREATE TABLE "loop_members" (
	"loop_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar DEFAULT 'member',
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loops" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "loops_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text NOT NULL,
	"picture" varchar NOT NULL,
	"created_on" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loops_name_unique" UNIQUE("name"),
	CONSTRAINT "loops_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "loop_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "loop_members" ADD CONSTRAINT "loop_members_loop_id_loops_id_fk" FOREIGN KEY ("loop_id") REFERENCES "public"."loops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loop_members" ADD CONSTRAINT "loop_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lm_loop_user" ON "loop_members" USING btree ("loop_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_lm_loop_role" ON "loop_members" USING btree ("loop_id","role");--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_loop_id_loops_id_fk" FOREIGN KEY ("loop_id") REFERENCES "public"."loops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_answers_question_id" ON "answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_answers_author_id" ON "answers" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_interactions_user_id" ON "interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_qt_question_id" ON "question_tags" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_qt_tag_id" ON "question_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_questions_author_id" ON "questions" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_questions_loop_id" ON "questions" USING btree ("loop_id");--> statement-breakpoint
CREATE INDEX "idx_questions_created_at" ON "questions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_questions_views" ON "questions" USING btree ("views");--> statement-breakpoint
CREATE INDEX "idx_saved_user_id" ON "saved_questions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_tags_name" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_votes_question_user" ON "votes" USING btree ("question_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_votes_answer_user" ON "votes" USING btree ("answer_id","user_id");