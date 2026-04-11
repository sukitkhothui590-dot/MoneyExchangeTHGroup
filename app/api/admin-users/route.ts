import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/admin-users — List all admin users
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    const { data, error } = await serviceClient.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Join with profiles table to get name/phone/role
    const { data: profiles } = await serviceClient
      .from("profiles")
      .select("id, name, phone, role, avatar_url");

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const adminUsers = data.users.map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        name: profile?.name ?? u.email?.split("@")[0] ?? "",
        phone: profile?.phone ?? null,
        role: profile?.role ?? "admin",
        avatar_url: profile?.avatar_url ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        email_confirmed: !!u.email_confirmed_at,
      };
    });

    return NextResponse.json({ data: adminUsers });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/admin-users — Create a new admin user
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const serviceClient = await createServiceClient();

    // Create auth user (email auto-confirmed)
    const { data: authData, error: authError } =
      await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name ?? email.split("@")[0] },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Update profile name if provided (trigger already creates the profile row)
    if (name && authData.user) {
      await serviceClient
        .from("profiles")
        .update({ name })
        .eq("id", authData.user.id);
    }

    const profile = await serviceClient
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    return NextResponse.json(
      {
        data: {
          id: authData.user.id,
          email: authData.user.email,
          name: profile.data?.name ?? name ?? "",
          role: "admin",
          created_at: authData.user.created_at,
          email_confirmed: true,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
