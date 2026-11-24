CREATE TABLE IF NOT EXISTS phones (
    id text PRIMARY KEY,
    name text NOT NULL,
    storage integer NOT NULL,
    color text NOT NULL,
    price integer NOT NULL CHECK (price > 0),
    pta_approved boolean NOT NULL,
    stock integer NOT NULL CHECK (stock >= 0)
);

CREATE TABLE IF NOT EXISTS preferences (
    user_id text PRIMARY KEY,
    preference text NOT NULL
);

CREATE TABLE IF NOT EXISTS model_usage (
    ledger text PRIMARY KEY,
    attempts integer NOT NULL CHECK (attempts >= 0)
);

CREATE TABLE IF NOT EXISTS reservations (
    code text PRIMARY KEY,
    user_id text NOT NULL,
    phone_id text NOT NULL REFERENCES phones(id),
    price integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO phones VALUES
    ('sam-a16-black', 'Samsung Galaxy A16', 128, 'Black', 43999, true, 30),
    ('red-note14-blue', 'Xiaomi Redmi Note 14', 128, 'Blue', 49999, true, 30),
    ('sam-a26-green', 'Samsung Galaxy A26', 256, 'Green', 69999, true, 20),
    ('google-pixel7-white', 'Google Pixel 7', 128, 'White', 54999, false, 10)
ON CONFLICT (id) DO NOTHING;
