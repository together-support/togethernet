ALTER TABLE "messages"
DROP COLUMN thread_data,
ADD COLUMN thread_previous_id int,
ADD COLUMN thread_next_id int;