# Deploy บน Vercel (สำหรับ demo / production)

โปรเจกต์นี้เป็น **Next.js App Router** — Vercel รองรับโดยตรง ไม่ต้องตั้งค่า Docker

## สิ่งที่ต้องมีก่อน deploy

1. บัญชี [Vercel](https://vercel.com) (เชื่อม GitHub/GitLab/Bitbucket หรืออัปโหลด ZIP)
2. โปรเจกต์ **Supabase** (ถ้าใช้ข้อมูลจริง) — ค่า URL, anon key, service role key

## ขั้นตอนสั้นๆ

### แบบเชื่อม Git (แนะนำ)

1. Push โค้ดขึ้น repository ของลูกค้า (ห้าม commit ไฟล์ `.env.local` — มีใน `.gitignore` แล้ว)
2. ใน Vercel: **Add New → Project** → เลือก repo
3. **Framework Preset**: Next.js (ตรวจจับอัตโนมัติ)
4. **Root Directory**: ถ้า monorepo ให้ชี้โฟลเดอร์ที่มี `package.json` ของแอปนี้
5. **Environment Variables**: คัดลอกจาก `.env.example` แล้วใส่ค่าจริง (ดูรายการด้านล่าง)
6. **Deploy**

### แบบส่ง ZIP / โฟลเดอร์

1. ใช้ Vercel CLI: `npm i -g vercel` แล้วรัน `vercel` ในโฟลเดอร์โปรเจกต์  
   หรือลากโฟลเดอร์เข้า [vercel.com/new](https://vercel.com/new) ตาม flow ของ Vercel

## ตัวแปรสภาพแวดล้อม (ใส่ใน Vercel)

| ตัวแปร | ที่ตั้งใน Vercel | หมายเหตุ |
|--------|------------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | URL โปรเจกต์ Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | คีย์ public (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview (และ Development ถ้าต้องการ) | **เก็บเป็นความลับ** — ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น |

ตัวเลือก (ดูรายละเอียดใน `.env.example`):

- `NEXT_PUBLIC_USE_MOCK_DATA` — ควบคุมการใช้ mock vs ข้อมูลจริงตามที่โค้ดรองรับ
- `NEXT_PUBLIC_IMAGE_PLACEHOLDERS` — โหมด placeholder รูป (ถ้าใช้)

หลังแก้ env ใน Vercel ให้ **Redeploy** เพื่อให้ค่าใหม่มีผล

## หลัง deploy

- ทดสอบ URL ที่ Vercel ให้ (`*.vercel.app` หรือโดเมนที่ผูก)
- ถ้าใช้ Supabase Auth / redirect URL ให้เพิ่ม URL ของ Vercel ใน **Supabase → Authentication → URL Configuration** (ถ้าโปรเจกต์ใช้ฟีเจอร์นี้)

## คำสั่งในเครื่อง (อ้างอิง)

```bash
npm install
npm run build
npm run start
```

พอร์ต dev ใน `package.json` อาจเป็น `30002` เฉพาะเครื่อง — บน Vercel ไม่ต้องตั้งพอร์ต

## ไฟล์ที่เกี่ยวข้อง

- `vercel.json` — บอกให้ build ด้วย `npm run build` (ค่า default ของ Vercel ก็ใกล้เคียงกัน)
- `.env.example` — template ตัวแปรสำหรับคัดไปใส่ Vercel โดยไม่มี secret จริง
