CREATE TABLE "messages"
(
  id serial,
  author VARCHAR(30) NOT NULL,
  content TEXT NOT NULL,
  room_id VARCHAR(30) NOT NULL,
  base_color VARCHAR(7) NOT NULL,
  secondary_colors VARCHAR(7)[],
  participant_names VARCHAR(30)[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_type message_type,
  position serial,
  commentable_id int
);