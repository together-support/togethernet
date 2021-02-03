ALTER TABLE "messages"
ADD COLUMN thread_data jsonb[],
DROP COLUMN thread_previous_id,
DROP COLUMN thread_next_id;