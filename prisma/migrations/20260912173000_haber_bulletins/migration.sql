CREATE TABLE IF NOT EXISTS haber_bulletins (
 day text PRIMARY KEY,
 body text NOT NULL,
 channel_url text NOT NULL,
 status text NOT NULL DEFAULT 'awaiting_channel_connection',
 updated_at timestamptz NOT NULL DEFAULT now()
);
