import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isOperatorRole,
} from "@/lib/server/profileRole";
import type { PhoneNumber } from "libphonenumber-js";
import {
  phoneLookupVariants,
  toE164,
  tryParseInternationalPhone,
  tryParseNationalPhone,
} from "@/lib/phone/international";
import { NextResponse } from "next/server";

// POST /api/pos/guest-member — สร้างสมาชิก Walk-in สำหรับ POS (มีเบอร์ / ไม่มีเบอร์)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const label =
      String(body.label ?? body.name ?? "ลูกค้า Walk-in").trim().slice(0, 120) ||
      "ลูกค้า Walk-in";

    const phoneCountry = String(body.phoneCountry ?? "").trim();
    const phoneNational = String(body.phoneNational ?? "").trim();
    const legacyPhone = String(body.phone ?? "").trim();

    const id = crypto.randomUUID();
    const email = `guest.${id.slice(0, 8)}@pos.internal`;

    const nationalDigits = phoneNational.replace(/\D/g, "");
    const hasNational = nationalDigits.length > 0;

    let parsed: PhoneNumber | null = null;

    if (hasNational) {
      if (!phoneCountry) {
        return NextResponse.json(
          { error: "เลือกประเทศสำหรับเบอร์โทร" },
          { status: 400 },
        );
      }
      parsed = tryParseNationalPhone(phoneNational, phoneCountry);
      if (!parsed) {
        return NextResponse.json(
          {
            error:
              "เบอร์ไม่ตรงกับประเทศที่เลือก — ใส่เฉพาะเลขท้องถิ่น (ไม่ต้องใส่ + หรือรหัสประเทศในช่องเบอร์)",
          },
          { status: 400 },
        );
      }
    } else if (legacyPhone.length > 0) {
      parsed = tryParseInternationalPhone(legacyPhone);
      if (!parsed) {
        return NextResponse.json(
          {
            error:
              "เบอร์โทรไม่ถูกต้อง — เลือกประเทศและใส่เลขท้องถิ่น หรือรูปแบบที่มีรหัสประเทศ (+66 …)",
          },
          { status: 400 },
        );
      }
    }

    const service = await createServiceClient();

    if (parsed) {
      const e164 = toE164(parsed);
      const variants = phoneLookupVariants(parsed);

      const { data: existingList, error: findErr } = await supabase
        .from("members")
        .select("*")
        .in("phone", variants)
        .limit(2);

      if (findErr) {
        return NextResponse.json({ error: findErr.message }, { status: 400 });
      }

      const existing = existingList?.[0];
      if (existing) {
        return NextResponse.json(
          { data: existing, existing: true as const },
          { status: 200 },
        );
      }

      const { data, error } = await service
        .from("members")
        .insert({
          name: label,
          email,
          phone: e164,
          status: "active",
          wallet_balance: 0,
          verified: false,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data, existing: false as const }, { status: 201 });
    }

    const { data, error } = await service
      .from("members")
      .insert({
        name: label,
        email,
        phone: `guest-${id.slice(0, 8)}`,
        status: "active",
        wallet_balance: 0,
        verified: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data, existing: false as const }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
