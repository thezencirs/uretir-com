CREATE TABLE member_accounts (
 id uuid PRIMARY KEY, handle text NOT NULL UNIQUE, display_name text NOT NULL,
 password_hash text NOT NULL, recovery_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE member_sessions (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX member_sessions_user ON member_sessions(user_id);
CREATE TABLE member_content (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('startup','post','comment')),
 parent_id uuid REFERENCES member_content(id) ON DELETE CASCADE,
 payload jsonb NOT NULL, status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending','published','rejected')),
 version integer NOT NULL DEFAULT 1, review_note text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz
);
CREATE UNIQUE INDEX member_one_startup ON member_content(user_id) WHERE kind='startup';
CREATE INDEX member_content_public ON member_content(status,kind,published_at DESC);
CREATE INDEX member_content_parent ON member_content(parent_id);
CREATE TABLE member_rate_limits (key text PRIMARY KEY, attempts integer NOT NULL DEFAULT 1, reset_at timestamptz NOT NULL);
CREATE TABLE member_review_log (
 id uuid PRIMARY KEY, content_id uuid NOT NULL REFERENCES member_content(id) ON DELETE CASCADE,
 decision text NOT NULL, note text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
