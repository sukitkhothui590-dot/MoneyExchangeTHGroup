import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isOperatorRole,
} from "@/lib/server/profileRole";
import {
  toE164,
  tryParseNationalPhone,
} from "@/lib/phone/international";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const identityLookupKey = String(body.identity_lookup_key ?? "").trim();
    const fullName = String(body.full_name ?? body.fullName ?? "").trim().slice(0, 120);
    const phoneCountry = String(body.phoneCountry ?? "").trim();
    const phoneNational = String(body.phoneNational ?? "").trim();

    console.log("[enroll] input:", { identityLookupKey, fullName, phoneCountry, phoneNational: phoneNational ? "***" : "" });

    if (!identityLookupKey || !fullName) {
      return NextResponse.json(
        { error: "identity_lookup_key และ full_name จำเป็น" },
        { status: 400 },
      );
    }

    const nationalDigits = phoneNational.replace(/\D/g, "");
    const hasPhone = nationalDigits.length > 0;

    let phoneValue = "";
    if (hasPhone) {
      if (!phoneCountry) {
        return NextResponse.json(
          { error: "เลือกประเทศสำหรับเบอร์โทร" },
          { status: 400 },
        );
      }
      const parsedPhone = tryParseNationalPhone(phoneNational, phoneCountry);
      if (!parsedPhone) {
        return NextResponse.json(
          { error: "เบอร์โทรไม่ตรงกับประเทศที่เลือก — ใส่เฉพาะเลขท้องถิ่นในช่องเบอร์" },
          { status: 400 },
        );
      }
      phoneValue = toE164(parsedPhone);
    }

    const service = await createServiceClient();

    // Check if column exists
    const { error: colCheck } = await service
      .from("members")
      .select("identity_lookup_key")
      .limit(0);

    if (colCheck) {
      console.error("[enroll] identity_lookup_key column missing:", colCheck.message);
      return NextResponse.json(
        { error: `คอลัมน์ identity_lookup_key ยังไม่มี — กรุณา run SQL: ALTER TABLE public.members ADD COLUMN IF NOT EXISTS identity_lookup_key text; ในหน้า Supabase SQL Editor` },
        { status: 500 },
      );
    }

    // Check existing
    const { data: existingRows, error: existErr } = await service
      .from("members")
      .select("id, name, identity_lookup_key")
      .eq("identity_lookup_key", identityLookupKey)
      .limit(1);

    if (existErr) {
      console.error("[enroll] check existing error:", existErr.message);
    }

    const existing = existingRows?.[0];
    if (existing) {
      console.log("[enroll] member already exists:", existing.id, existing.name);
      return NextResponse.json(
        { error: "มีสมาชิกที่ใช้เอกสารนี้แล้ว — ใช้ปุ่มสแกนอีกครั้งเพื่อโหลด" },
        { status: 409 },
      );
    }

    const id = crypto.randomUUID();
    const email = `identity.${id.slice(0, 8)}@pos.internal`;

    console.log("[enroll] inserting member:", { id, email, fullName, identityLookupKey, phone: phoneValue || `identity-${id.slice(0, 8)}` });

    const { data, error } = await service
      .from("members")
      .insert({
        name: fullName,
        email,
        phone: phoneValue || `identity-${id.slice(0, 8)}`,
        status: "active",
        wallet_balance: 0,
        verified: true,
        identity_lookup_key: identityLookupKey,
      })
      .select()
      .single();

    if (error) {
      console.error("[enroll] insert error:", error.message, error.code, error.details);
      return NextResponse.json({ error: `สร้างสมาชิกไม่สำเร็จ: ${error.message}` }, { status: 400 });
    }

    console.log("[enroll] ✅ member created:", data.id, data.name);

    // Verify the insert by reading back
    const { data: verifyRows, error: verifyErr } = await service
      .from("members")
      .select("id, name, identity_lookup_key")
      .eq("id", data.id)
      .limit(1);

    const verified = verifyRows?.[0];
    if (verifyErr || !verified) {
      console.error("[enroll] ⚠️ verify read-back failed:", verifyErr?.message);
    } else {
      console.log("[enroll] ✅ verified in DB:", verified.id, "key:", verified.identity_lookup_key);
      if (!verified.identity_lookup_key) {
        console.error("[enroll] ⚠️ identity_lookup_key is NULL in DB after insert! Column might be ignored by PostgREST.");
      }
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error("[enroll] UNHANDLED ERROR:", e);
    return NextResponse.json(
      { error: `Internal server error: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 500 },
    );
  }
}
