import { createClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isOperatorRole,
} from "@/lib/server/profileRole";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get("sessionKey")?.trim();
    const memberId = searchParams.get("memberId")?.trim();

    if (sessionKey) {
      const { data, error } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("session_key", sessionKey)
        .maybeSingle();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    if (memberId) {
      const { data, error } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("member_id", memberId)
        .order("updated_at", { ascending: false })
        .limit(5);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data: data ?? [] });
    }

    return NextResponse.json(
      { error: "sessionKey or memberId required" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const sessionKey = String(body.session_key ?? body.sessionKey ?? "").trim();
    const memberId = String(body.member_id ?? body.memberId ?? "").trim();
    const fullName = String(body.full_name ?? body.fullName ?? "");
    const idNumber = String(body.id_number ?? body.idNumber ?? "");
    const status = (body.status ?? "pending") as "pending" | "verified" | "rejected";
    const note = String(body.note ?? "");

    if (!sessionKey || !memberId) {
      return NextResponse.json(
        { error: "session_key and member_id are required" },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from("kyc_submissions")
      .select("id")
      .eq("session_key", sessionKey)
      .maybeSingle();

    const now = new Date().toISOString();
    if (existing?.id) {
      const { data, error } = await supabase
        .from("kyc_submissions")
        .update({
          full_name: fullName,
          id_number: idNumber,
          status,
          note,
          updated_at: now,
          staff_user_id: session.userId,
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ data });
    }

    const { data, error } = await supabase
      .from("kyc_submissions")
      .insert({
        member_id: memberId,
        staff_user_id: session.userId,
        session_key: sessionKey,
        full_name: fullName,
        id_number: idNumber,
        status,
        note,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
