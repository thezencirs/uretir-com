CREATE TABLE marketplace_listings (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('property','vehicle')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','published','rejected','expired')),
  version integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(16,2) NOT NULL CHECK (price > 0),
  currency text NOT NULL DEFAULT 'TRY',
  city text NOT NULL,
  district text NOT NULL,
  neighborhood text NOT NULL DEFAULT '',
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  location_precision text NOT NULL DEFAULT 'exact' CHECK (location_precision IN ('exact','approximate')),
  seller_role text NOT NULL CHECK (seller_role IN ('owner','dealer','agent')),
  contact_mode text NOT NULL DEFAULT 'secure_request' CHECK (contact_mode IN ('secure_request','profile')),
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  verification_image text,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_fingerprint text NOT NULL,
  price_reference numeric(16,2),
  price_anomaly_pct numeric(8,2),
  moderation_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_note text NOT NULL DEFAULT '',
  submitted_at timestamptz,
  published_at timestamptz,
  expires_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX marketplace_listings_public ON marketplace_listings(kind,status,published_at DESC);
CREATE INDEX marketplace_listings_geo ON marketplace_listings(city,district,kind,status);
CREATE INDEX marketplace_listings_owner ON marketplace_listings(user_id,updated_at DESC);
CREATE INDEX marketplace_listings_fingerprint ON marketplace_listings(content_fingerprint);

CREATE TABLE marketplace_reports (
  id uuid PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  reporter_user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('wrong_info','suspicious_price','duplicate','sold','fraud_risk','other')),
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id,reporter_user_id,reason)
);
CREATE INDEX marketplace_reports_open ON marketplace_reports(status,created_at DESC);

CREATE TABLE marketplace_contact_requests (
  id uuid PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  seller_user_id uuid NOT NULL REFERENCES member_accounts(id) ON DELETE CASCADE,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  seller_reply text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id,buyer_user_id)
);
CREATE INDEX marketplace_contacts_seller ON marketplace_contact_requests(seller_user_id,status,created_at DESC);
CREATE INDEX marketplace_contacts_buyer ON marketplace_contact_requests(buyer_user_id,created_at DESC);
