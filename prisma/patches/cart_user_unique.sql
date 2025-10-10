-- Ensure unique cart per user
CREATE UNIQUE INDEX IF NOT EXISTS Cart_userId_key ON Cart(userId);


