CREATE TABLE "messages"
(
  id serial,
  author VARCHAR(30) NOT NULL,
  content TEXT NOT NULL,
  room_id VARCHAR(30) NOT NULL,
  participant_names VARCHAR(30)[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_type message_type,
  position int,
  commentable_id int,
  thread_previous_id int,
  thread_next_id int
);