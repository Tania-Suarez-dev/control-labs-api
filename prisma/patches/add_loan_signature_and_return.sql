-- Patch: firma y devolución de préstamos.
-- La tabla public.loan_equipment YA existe; este patch NO la crea.
-- Aplicar una sola vez sobre la BD existente.

BEGIN;

ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS accepted_by_guard_id uuid NULL,
  ADD COLUMN IF NOT EXISTS returned_at timestamptz(6) NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_loans_accepted_by_guard'
  ) THEN
    ALTER TABLE public.loans
      ADD CONSTRAINT fk_loans_accepted_by_guard
      FOREIGN KEY (accepted_by_guard_id)
      REFERENCES public.users (id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_loan_equipment_equipment_activa
  ON public.loan_equipment (equipment_id)
  WHERE returned_at IS NULL;

-- Los préstamos históricos ya devueltos no deben quedar como devolubles otra vez.
UPDATE public.loans l
SET returned_at = COALESCE(
  l.returned_at,
  (
    SELECT max(le.returned_at)
    FROM public.loan_equipment le
    WHERE le.loan_id = l.id
  )
)
WHERE l.returned_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.loan_equipment le
    WHERE le.loan_id = l.id
      AND le.returned_at IS NOT NULL
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.loan_equipment le
    WHERE le.loan_id = l.id
      AND le.returned_at IS NULL
  );

COMMIT;
