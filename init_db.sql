CREATE TYPE "permission_t_t" AS ENUM ('student', 'professor', 'admin');

CREATE TABLE "user_info" (
	"uid" serial NOT NULL,
	"id" varchar(255),
	"password" varchar(255) NOT NULL,
	-- student - s, professor - p, admin - a
	"permission_t" permission_t_t NOT NULL DEFAULT 'student',
	"student_id" int,
	"nick_name" varchar(255) NOT NULL,
	"create_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"delete_at" TIMESTAMPTZ,
	PRIMARY KEY("uid")
);

CREATE TABLE "problem_set" (
	"uid" serial NOT NULL,
	"cuid" int NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" json NOT NULL,
	"create_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"delete_at" TIMESTAMPTZ,
	PRIMARY KEY("uid")
);

CREATE TABLE "course" (
	"uid" serial NOT NULL,
	-- common - 0, class - 1, competition - 2
	"board" smallint NOT NULL,
	"open" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"close" TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
	"create_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"delete_at" TIMESTAMPTZ,
	PRIMARY KEY("uid")
);

CREATE TABLE "course_owner" (
	"uid" serial NOT NULL,
	"course_id" int NOT NULL,
	"user_id" int NOT NULL,
	PRIMARY KEY("uid")
);

CREATE TYPE "result_t_t" AS ENUM ('correct', 'compile_error', 'runtime_error', 'fail');

CREATE TABLE "solution_history" (
	"uid" serial NOT NULL,
	"puid" int NOT NULL,
	"source" varchar(255),
	"create_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"runtime" int,
	"memory" int,
	"result_t" result_t_t NOT NULL,
	"user_id" int NOT NULL,
	PRIMARY KEY("uid")
);

CREATE TABLE "whitelist_entries" (
	"uid" int NOT NULL,
	"cid" int,
	"user_id" int,
	"create_at" TIMESTAMPTZ DEFAULT now(),
	"delete_at" TIMESTAMPTZ,
	PRIMARY KEY("uid")
);

CREATE TYPE "mode_t" AS ENUM ('test_case', 'special');

CREATE TABLE "answer_set" (
	"uid" serial NOT NULL,
	"puid" int,
	"mode" mode_t DEFAULT 'test_case',
	"input" varchar(255),
	"output" varchar(255),
	"answer_code" varchar(255),
	PRIMARY KEY("uid")
);

ALTER TABLE "solution_history"
ADD FOREIGN KEY("user_id") REFERENCES "user_info"("uid")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "whitelist_entries"
ADD FOREIGN KEY("user_id") REFERENCES "user_info"("uid")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "whitelist_entries"
ADD FOREIGN KEY("cid") REFERENCES "course"("uid")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "problem_set"
ADD FOREIGN KEY("cuid") REFERENCES "course"("uid")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "solution_history"
ADD FOREIGN KEY("puid") REFERENCES "problem_set"("uid")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "course_owner"
ADD FOREIGN KEY("course_id") REFERENCES "course"("uid")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "course_owner"
ADD FOREIGN KEY("user_id") REFERENCES "user_info"("uid")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "answer_set"
ADD FOREIGN KEY("puid") REFERENCES "problem_set"("uid")
ON UPDATE NO ACTION ON DELETE NO ACTION;