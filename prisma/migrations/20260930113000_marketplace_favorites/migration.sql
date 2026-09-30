CREATE TABLE marketplace_favorites (
  user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('property','vehicle')),
  title text NOT NULL,
  price numeric(16,2),
  image_url text,
  source_url text,
  detail_url text,
  location_label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,item_key)
);
CREATE INDEX marketplace_favorites_user ON marketplace_favorites(user_id,created_at DESC);
