-- Optional human-readable booking reference for customer confirmation / QR
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS confirmation_code text NOT NULL DEFAULT '';
