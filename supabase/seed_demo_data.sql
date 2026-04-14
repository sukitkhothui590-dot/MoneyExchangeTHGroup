-- =============================================================================
-- Seed ข้อมูลเดโม (INSERT) — รันใน Supabase SQL Editor หลัง apply migrations แล้ว
-- คำนำหน้า: สาขา demo-seed-* | สมาชิก UUID คงที่ | อีเมล @demo-seed.local
-- รันซ้ำได้: ลบข้อมูล demo-seed เก่าในตารางที่เกี่ยวข้องแล้ว insert ใหม่
-- ลบทั้งหมดได้ด้วย seed_demo_cleanup.sql
-- =============================================================================

BEGIN;

-- ล้างของเดโมรอบก่อน (ปลอดภัยเฉพาะ branch_id / session ที่ขึ้นต้น demo-seed)
DELETE FROM public.pos_transactions WHERE branch_id LIKE 'demo-seed-%';
DELETE FROM public.bookings WHERE branch_id LIKE 'demo-seed-%';
DELETE FROM public.staff_branch_assignments WHERE branch_id LIKE 'demo-seed-%';

-- สาขาเดโม
INSERT INTO public.branches (id, name, name_th, address_th, status)
VALUES
  (
    'demo-seed-siam',
    'Demo Siam',
    'สาขาเดโม สยาม',
    'ปทุมวัน (ข้อมูลทดสอบ)',
    'active'
  ),
  (
    'demo-seed-sukhumvit',
    'Demo Sukhumvit',
    'สาขาเดโม สุขุมวิท',
    'คลองเตย (ข้อมูลทดสอบ)',
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_th = EXCLUDED.name_th,
  address_th = EXCLUDED.address_th,
  status = EXCLUDED.status;

-- สมาชิกเดโม
INSERT INTO public.members (
  id,
  name,
  email,
  phone,
  status,
  wallet_balance,
  verified
)
VALUES
  (
    'a1111111-1111-1111-1111-111111111101'::uuid,
    'เดโม สมชาย',
    'somchai@demo-seed.local',
    '0811111111',
    'active',
    5000,
    true
  ),
  (
    'a1111111-1111-1111-1111-111111111102'::uuid,
    'เดโม สมหญิง',
    'somying@demo-seed.local',
    '0822222222',
    'active',
    12000,
    false
  ),
  (
    'a1111111-1111-1111-1111-111111111103'::uuid,
    'Walk-in Demo',
    'walkin@demo-seed.local',
    '0833333333',
    'active',
    0,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  wallet_balance = EXCLUDED.wallet_balance,
  verified = EXCLUDED.verified;

-- การจองเดโม (คิว POS)
INSERT INTO public.bookings (
  member_id,
  member_name,
  currency_code,
  currency_flag,
  amount,
  rate,
  total_thb,
  pickup_method,
  branch_id,
  branch_name,
  status,
  note
)
VALUES
  (
    'a1111111-1111-1111-1111-111111111101'::uuid,
    'เดโม สมชาย',
    'USD',
    '🇺🇸',
    500,
    35.25,
    17625,
    'branch',
    'demo-seed-siam',
    'สาขาเดโม สยาม',
    'approved',
    'demo-seed'
  ),
  (
    'a1111111-1111-1111-1111-111111111102'::uuid,
    'เดโม สมหญิง',
    'EUR',
    '🇪🇺',
    200,
    38.5,
    7700,
    'branch',
    'demo-seed-siam',
    'สาขาเดโม สยาม',
    'pending_review',
    'demo-seed'
  ),
  (
    'a1111111-1111-1111-1111-111111111103'::uuid,
    'Walk-in Demo',
    'USD',
    '🇺🇸',
    100,
    35.2,
    3520,
    'branch',
    'demo-seed-sukhumvit',
    'สาขาเดโม สุขุมวิท',
    'pending_payment',
    'demo-seed'
  );

COMMIT;

-- KYC เดโม (แยกบล็อก — ถ้ายังไม่มีตารางจะไม่ทำให้ล้มทั้งชุด)
DO $$
BEGIN
  DELETE FROM public.kyc_submissions WHERE session_key LIKE 'demo-seed-%';
  INSERT INTO public.kyc_submissions (
    member_id,
    session_key,
    status,
    full_name,
    id_number,
    note
  )
  VALUES
    (
      'a1111111-1111-1111-1111-111111111101'::uuid,
      'demo-seed-kyc-session-001',
      'pending',
      'เดโม สมชาย',
      '1100XXXXXXXXXX',
      'demo-seed'
    )
  ON CONFLICT (session_key) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    id_number = EXCLUDED.id_number,
    status = EXCLUDED.status,
    updated_at = now();
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'ข้าม kyc_submissions (ยังไม่มีตาราง)';
END $$;

-- ธุรกรรม POS เดโม
DO $$
DECLARE
  v_staff uuid;
BEGIN
  SELECT id INTO v_staff
  FROM public.profiles
  WHERE role IN ('admin', 'staff')
  ORDER BY CASE WHEN role = 'staff' THEN 0 ELSE 1 END, created_at
  LIMIT 1;

  IF v_staff IS NULL THEN
    RAISE NOTICE 'ไม่มี profiles admin/staff — ข้าม pos_transactions';
    RETURN;
  END IF;

  INSERT INTO public.pos_transactions (
    member_id,
    branch_id,
    staff_user_id,
    currency_code,
    amount,
    rate,
    total_thb,
    note,
    status
  )
  VALUES
    (
      'a1111111-1111-1111-1111-111111111101'::uuid,
      'demo-seed-siam',
      v_staff,
      'USD',
      100,
      35.5,
      3550,
      'demo-seed txn 1',
      'active'
    ),
    (
      'a1111111-1111-1111-1111-111111111102'::uuid,
      'demo-seed-siam',
      v_staff,
      'EUR',
      50,
      38,
      1900,
      'demo-seed txn 2',
      'active'
    );
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'ข้าม pos_transactions (ยังไม่มีตาราง)';
  WHEN OTHERS THEN
    RAISE NOTICE 'pos_transactions: %', SQLERRM;
END $$;

-- มอบหมายสาขาเดโมให้ staff คนแรก (ถ้ามี)
INSERT INTO public.staff_branch_assignments (user_id, branch_id)
SELECT s.id, v.bid
FROM (
  SELECT id FROM public.profiles WHERE role = 'staff' ORDER BY created_at NULLS LAST LIMIT 1
) s
CROSS JOIN (VALUES ('demo-seed-siam'), ('demo-seed-sukhumvit')) AS v(bid)
ON CONFLICT (user_id, branch_id) DO NOTHING;
