CREATE TABLE transactions (
  user_id VARCHAR REFERENCES users(id),
  account_id VARCHAR NOT NULL,
  transaction_id VARCHAR NOT NULL,
  timestamp VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  amount DECIMAL NOT NULL,
  currency VARCHAR NOT NULL,
  transaction_type VARCHAR NOT NULL,
  transaction_category VARCHAR NOT NULL,
  transaction_classification VARCHAR[],
  merchant_name VARCHAR,
  bank_transaction_id VARCHAR NOT NULL,
  provider_transaction_category VARCHAR NOT NULL,
  running_balance_amount DECIMAL,
  running_balance_currency VARCHAR
);