-- =============================================================================
-- ลบข้อมูลที่ seed_demo_data.sql สร้างไว้ (รันใน Supabase SQL Editor)
-- ลำดับตาม FK: ธุรกรรม/จอง → KYC → มอบหมายสาขา → สมาชิก → สาขา
-- =============================================================================

BEGIN;

DELETE FROM public.pos_transactions WHERE branch_id LIKE 'demo-seed-%';

DELETE FROM public.bookings WHERE branch_id LIKE 'demo-seed-%';

DO $$
BEGIN
  DELETE FROM public.kyc_submissions WHERE session_key LIKE 'demo-seed-%';
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

DELETE FROM public.staff_branch_assignments WHERE branch_id LIKE 'demo-seed-%';

DELETE FROM public.members
WHERE id IN (
  'a1111111-1111-1111-1111-111111111101'::uuid,
  'a1111111-1111-1111-1111-111111111102'::uuid,
  'a1111111-1111-1111-1111-111111111103'::uuid
)
OR email LIKE '%@demo-seed.local';

DELETE FROM public.branches WHERE id LIKE 'demo-seed-%';

COMMIT;
