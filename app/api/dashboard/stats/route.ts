import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/dashboard/stats — Get dashboard statistics
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch counts in parallel
    const [
      { count: currencyCount },
      { count: branchCount },
      { count: articleCount },
      { data: topCurrencies },
      { data: recentArticles },
      { data: branches },
    ] = await Promise.all([
      supabase.from("currencies").select("*", { count: "exact", head: true }),
      supabase.from("branches").select("*", { count: "exact", head: true }),
      supabase.from("articles").select("*", { count: "exact", head: true }),
      supabase.from("currencies").select("*").order("code").limit(5),
      supabase
        .from("articles")
        .select("id, title, status, article_type, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("branches")
        .select("id, name, name_th, address, hours, status")
        .order("name", { ascending: true }),
    ]);

    let adminUserCount = 0;
    try {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const serviceClient = await createServiceClient();
      const { data: usersData } = await serviceClient.auth.admin.listUsers();
      adminUserCount = usersData?.users?.length ?? 0;
    } catch {
      // Ignore — admin count non-critical
    }

    return NextResponse.json({
      data: {
        stats: {
          currencies: currencyCount || 0,
          branches: branchCount || 0,
          articles: articleCount || 0,
          adminUsers: adminUserCount,
        },
        topCurrencies: topCurrencies || [],
        recentArticles: recentArticles || [],
        branches: branches || [],
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
