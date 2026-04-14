-- คีย์ค้นหาเดียวต่อเอกสาร (พาสปอร์ต / เลขบัตร ปชช.) สำหรับ POS ยืนยันตัวตน

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS identity_lookup_key text;

COMMENT ON COLUMN public.members.identity_lookup_key IS 'คีย์ normalize สำหรับค้นหาซ้ำจากสแกน MRZ/บัตร (เช่น PASSPORT|USA|AB123456, TH-NID|3100...)';

CREATE UNIQUE INDEX IF NOT EXISTS members_identity_lookup_key_uidx
  ON public.members (identity_lookup_key)
  WHERE identity_lookup_key IS NOT NULL AND btrim(identity_lookup_key) <> '';
