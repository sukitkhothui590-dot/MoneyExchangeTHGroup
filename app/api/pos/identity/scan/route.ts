import { resolveIdentityInput } from "@/lib/identity/parseScan";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isOperatorRole,
} from "@/lib/server/profileRole";
import { NextResponse } from "next/server";

function extractSearchFragment(key: string): string | null {
  const parts = key.split("|");
  if (parts.length >= 2) {
    const last = parts[parts.length - 1]!.trim();
    if (last.length >= 5) return last;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const identity_lookup_key = String(body.identity_lookup_key ?? "").trim();
    const raw = String(body.raw ?? "").trim();
    const full_name = String(body.full_name ?? "").trim();

    console.log("[scan] input:", { identity_lookup_key, raw: raw.slice(0, 80), full_name });

    const resolvedFromKey = identity_lookup_key
      ? resolveIdentityInput({ identity_lookup_key, full_name: full_name || undefined })
      : null;
    const resolvedFromRaw = raw
      ? resolveIdentityInput({ raw, full_name: full_name || undefined })
      : null;

    console.log("[scan] resolvedFromKey:", resolvedFromKey?.identityKey ?? "null", resolvedFromKey?.source ?? "");
    console.log("[scan] resolvedFromRaw:", resolvedFromRaw?.identityKey ?? "null", resolvedFromRaw?.source ?? "");

    const resolved = resolvedFromKey ?? resolvedFromRaw;
    if (!resolved) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่ใช้ได้ — ส่ง identity_lookup_key หรือ raw ที่มี MRZ / เลข ปชช. ไทย 13 หลัก" },
        { status: 400 },
      );
    }

    const service = await createServiceClient();

    // First check if the column exists by doing a safe query
    const { error: colCheck } = await service
      .from("members")
      .select("identity_lookup_key")
      .limit(0);

    if (colCheck) {
      console.error("[scan] identity_lookup_key column check failed:", colCheck.message);
      // Column might not exist — try to create it
      const { error: alterErr } = await service.rpc("exec_sql" as never, {
        query: "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS identity_lookup_key text;",
      } as never);
      if (alterErr) {
        console.error("[scan] Could not auto-create column:", alterErr.message);
        return NextResponse.json({
          error: `คอลัมน์ identity_lookup_key ยังไม่มีในฐานข้อมูล — กรุณา run migration: ALTER TABLE public.members ADD COLUMN IF NOT EXISTS identity_lookup_key text;`,
          debug: { colCheck: colCheck.message },
        }, { status: 500 });
      }
    }

    const keysToTry = new Set<string>();
    if (resolvedFromKey) keysToTry.add(resolvedFromKey.identityKey);
    if (resolvedFromRaw) keysToTry.add(resolvedFromRaw.identityKey);

    console.log("[scan] keysToTry:", [...keysToTry]);

    // Strategy 1: exact key match
    for (const key of keysToTry) {
      const { data: rows, error: err } = await service
        .from("members")
        .select("*")
        .eq("identity_lookup_key", key)
        .limit(1);

      if (err) {
        console.error("[scan] exact match error:", err.message);
        continue;
      }

      const member = rows?.[0];
      if (member) {
        console.log("[scan] ✅ exact match found:", member.id, member.name);
        return memberFoundResponse(service, member, resolved);
      }
    }

    // Strategy 2: fuzzy search by document number fragment
    const fragments = new Set<string>();
    for (const key of keysToTry) {
      const frag = extractSearchFragment(key);
      if (frag) fragments.add(frag);
    }
    for (const r of [resolvedFromKey, resolvedFromRaw]) {
      if (r?.source === "mrz") fragments.add(r.documentNumber);
      if (r?.source === "th_national_id") fragments.add(r.nationalId);
    }

    console.log("[scan] fragments for LIKE search:", [...fragments]);

    for (const frag of fragments) {
      const { data: rows, error: err } = await service
        .from("members")
        .select("*")
        .like("identity_lookup_key", `%${frag}%`)
        .limit(1);

      if (err) {
        console.error("[scan] LIKE search error:", err.message);
        continue;
      }

      const member = rows?.[0];
      if (member) {
        console.log("[scan] ✅ LIKE match found:", member.id, member.name, "key:", member.identity_lookup_key);
        return memberFoundResponse(service, member, resolved);
      }
    }

    // Strategy 3: search ALL members with non-null identity_lookup_key (last resort for small datasets)
    const { data: allKeyed, error: allErr } = await service
      .from("members")
      .select("id, name, identity_lookup_key")
      .not("identity_lookup_key", "is", null)
      .limit(100);

    if (!allErr && allKeyed && allKeyed.length > 0) {
      console.log("[scan] all members with identity_lookup_key:", allKeyed.map(m => ({ id: m.id, key: m.identity_lookup_key })));

      for (const m of allKeyed) {
        const storedKey = (m.identity_lookup_key as string) ?? "";
        for (const searchKey of keysToTry) {
          if (storedKey === searchKey) {
            const { data: fullRows } = await service.from("members").select("*").eq("id", m.id as string).limit(1);
            if (fullRows?.[0]) {
              console.log("[scan] ✅ manual scan match:", m.id);
              return memberFoundResponse(service, fullRows[0], resolved);
            }
          }
        }
        for (const frag of fragments) {
          if (storedKey.includes(frag)) {
            const { data: fullRows } = await service.from("members").select("*").eq("id", m.id as string).limit(1);
            if (fullRows?.[0]) {
              console.log("[scan] ✅ manual fragment match:", m.id);
              return memberFoundResponse(service, fullRows[0], resolved);
            }
          }
        }
      }
    } else {
      console.log("[scan] no members with identity_lookup_key found. allErr:", allErr?.message ?? "none", "count:", allKeyed?.length ?? 0);
    }

    console.log("[scan] ❌ no member found, returning new_identity");

    return NextResponse.json({
      data: {
        status: "new_identity" as const,
        resolved,
        _debug: {
          keysSearched: [...keysToTry],
          fragments: [...fragments],
          membersWithKey: allKeyed?.length ?? 0,
        },
      },
    });
  } catch (e) {
    console.error("[scan] UNHANDLED ERROR:", e);
    return NextResponse.json(
      { error: `Internal server error: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 500 },
    );
  }
}

async function memberFoundResponse(
  service: Awaited<ReturnType<typeof createServiceClient>>,
  member: Record<string, unknown>,
  resolved: ReturnType<typeof resolveIdentityInput>,
) {
  let visitCount = 0;
  try {
    const { count } = await service
      .from("pos_transactions")
      .select("*", { count: "exact", head: true })
      .eq("member_id", member.id as string)
      .eq("status", "active");
    visitCount = count ?? 0;
  } catch {
    // pos_transactions might not exist
  }

  return NextResponse.json({
    data: {
      status: "member_found" as const,
      member: { ...member, visit_count: visitCount },
      resolved,
    },
  });
}
