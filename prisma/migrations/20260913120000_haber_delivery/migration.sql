CREATE TABLE IF NOT EXISTS haber_deliveries (
 article_id text PRIMARY KEY REFERENCES haber_articles(id),
 claim_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'sending',
 message_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 sent_at timestamptz
);
