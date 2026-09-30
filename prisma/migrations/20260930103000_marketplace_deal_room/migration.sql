CREATE TABLE marketplace_deal_requests (
  id uuid PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  seller_user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('offer','visit','inspection')),
  amount numeric(16,2),
  preferred_at timestamptz,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','countered','withdrawn')),
  counter_amount numeric(16,2),
  seller_reply text NOT NULL DEFAULT '',
  expires_at timestamptz NOT NULL DEFAULT (now()+interval '72 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX marketplace_deals_listing ON marketplace_deal_requests(listing_id,status,created_at DESC);
CREATE INDEX marketplace_deals_buyer ON marketplace_deal_requests(buyer_user_id,created_at DESC);
CREATE INDEX marketplace_deals_seller ON marketplace_deal_requests(seller_user_id,status,created_at DESC);
CREATE UNIQUE INDEX marketplace_deals_one_pending_kind ON marketplace_deal_requests(listing_id,buyer_user_id,kind) WHERE status IN ('pending','countered');
