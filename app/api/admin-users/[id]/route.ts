import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PATCH /api/admin-users/[id] — Update admin user (name, phone, reset password)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const serviceClient = await createServiceClient();

    // If new_password provided, update via admin auth API
    if (body.new_password) {
      if (body.new_password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 },
        );
      }
      const { error: pwError } = await serviceClient.auth.admin.updateUserById(
        id,
        { password: body.new_password },
      );
      if (pwError) {
        return NextResponse.json({ error: pwError.message }, { status: 400 });
      }
    }

    // Update profile fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;

    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await serviceClient
        .from("profiles")
        .update(updateData)
        .eq("id", id);

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 400 },
        );
      }
    }

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    return NextResponse.json({ data: profile });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin-users/[id] — Delete admin user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    const serviceClient = await createServiceClient();

    const { error } = await serviceClient.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Admin user deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
