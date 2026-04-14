import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isAdminRole,
} from "@/lib/server/profileRole";
import { NextResponse } from "next/server";

// GET /api/admin-users — List users (admin only)
export async function GET() {
  try {
    const supabase = await createClient();

    const session = await getSessionProfile(supabase);
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    const { data: assignmentRows } = await serviceClient
      .from("staff_branch_assignments")
      .select("user_id, branch_id");

    const branchesByUser = new Map<string, string[]>();
    for (const row of assignmentRows ?? []) {
      const list = branchesByUser.get(row.user_id) ?? [];
      list.push(row.branch_id);
      branchesByUser.set(row.user_id, list);
    }

    const adminUsers = data.users.map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        name: profile?.name ?? u.email?.split("@")[0] ?? "",
        phone: profile?.phone ?? null,
        role: (profile?.role ?? "admin") as "admin" | "staff" | "customer",
        avatar_url: profile?.avatar_url ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        email_confirmed: !!u.email_confirmed_at,
        branch_ids:
          profile?.role === "staff"
            ? (branchesByUser.get(u.id) ?? [])
            : [],
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

// POST /api/admin-users — Create staff or admin user (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const session = await getSessionProfile(supabase);
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password } = body;
    const roleRaw = body.role === "staff" ? "staff" : "admin";
    const branchIdsRaw = body.branch_ids ?? body.branchIds;
    const branchIds: string[] = Array.isArray(branchIdsRaw)
      ? branchIdsRaw.map((x: unknown) => String(x)).filter(Boolean)
      : [];

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (roleRaw === "staff" && branchIds.length === 0) {
      return NextResponse.json(
        { error: "Staff accounts require at least one branch (branch_ids)" },
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
    const displayName = name ?? email.split("@")[0];

    const { data: authData, error: authError } =
      await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: displayName,
          app_role: roleRaw,
        },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Update profile name if provided (trigger already creates the profile row)
    if (authData.user) {
      await serviceClient
        .from("profiles")
        .update({ name: displayName, role: roleRaw })
        .eq("id", authData.user.id);
    }

    if (authData.user && roleRaw === "staff" && branchIds.length > 0) {
      const rows = branchIds.map((branch_id) => ({
        user_id: authData.user.id,
        branch_id,
      }));
      const { error: assignErr } = await serviceClient
        .from("staff_branch_assignments")
        .insert(rows);
      if (assignErr) {
        return NextResponse.json({ error: assignErr.message }, { status: 400 });
      }
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
          name: profile.data?.name ?? displayName,
          role: roleRaw,
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
