ALTER TABLE member_accounts
  ADD COLUMN IF NOT EXISTS marketplace_roles text[] NOT NULL DEFAULT ARRAY['buyer']::text[];

ALTER TABLE member_accounts
  DROP CONSTRAINT IF EXISTS member_marketplace_roles_valid;

ALTER TABLE member_accounts
  ADD CONSTRAINT member_marketplace_roles_valid CHECK (
    marketplace_roles <@ ARRAY['buyer','seller']::text[]
    AND cardinality(marketplace_roles) >= 1
  );

CREATE TABLE marketplace_conversations (
  id uuid PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  seller_user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id,buyer_user_id)
);

CREATE INDEX marketplace_conversations_buyer ON marketplace_conversations(buyer_user_id,updated_at DESC);
CREATE INDEX marketplace_conversations_seller ON marketplace_conversations(seller_user_id,updated_at DESC);

CREATE TABLE marketplace_messages (
  id uuid PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES marketplace_conversations(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1200),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX marketplace_messages_conversation ON marketplace_messages(conversation_id,created_at);
CREATE INDEX marketplace_messages_unread ON marketplace_messages(conversation_id,read_at);
