ALTER TABLE "leave_requests" ALTER COLUMN "start_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "leave_requests" ALTER COLUMN "end_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "user_leaves" ALTER COLUMN "used_leave" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_leaves" DROP COLUMN "total_working_days";