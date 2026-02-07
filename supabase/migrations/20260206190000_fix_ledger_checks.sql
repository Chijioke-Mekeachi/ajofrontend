-- Align ledger constraints with app logic.
-- The application inserts ledger.type values like: deposit, withdrawal, contribution, card_verification, debit, payout.
-- It also uses ledger.status values like: pending, completed, failed.

ALTER TABLE public.ledger
DROP CONSTRAINT IF EXISTS ledger_type_check;

ALTER TABLE public.ledger
ADD CONSTRAINT ledger_type_check
CHECK (
  type IN (
    'debit',
    'credit',
    'payout',
    'deposit',
    'withdrawal',
    'contribution',
    'card_verification'
  )
);

ALTER TABLE public.ledger
DROP CONSTRAINT IF EXISTS ledger_status_check;

ALTER TABLE public.ledger
ADD CONSTRAINT ledger_status_check
CHECK (
  status IN (
    'pending',
    'completed',
    'failed',
    -- legacy value from earlier schema iterations
    'success'
  )
);

