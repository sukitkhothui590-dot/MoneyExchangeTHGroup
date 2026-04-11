import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, phone, company, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อ อีเมล และข้อความ" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        phone: phone || null,
        company: company || null,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error("Contact insert error:", error.message);
      return NextResponse.json(
        { error: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { data, message: "ส่งข้อความเรียบร้อยแล้ว" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
