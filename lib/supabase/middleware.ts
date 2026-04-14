import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, skip auth check and let request through
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase env vars missing — skipping auth middleware");
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Do not call request.cookies.set — it throws / breaks on Edge (Vercel).
        // Only mutate the response cookies (Supabase + Next.js guidance).
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // POS: require auth except login; customers cannot use POS app
  if (path.startsWith("/pos") && !path.startsWith("/pos/login")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/pos/login";
      return NextResponse.redirect(url);
    }
    const { data: posProf } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (posProf?.role === "customer") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Protect admin dashboard routes
  if (!user && path.startsWith("/admin/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Staff cannot use admin dashboard
  if (user && path.startsWith("/admin/dashboard")) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (prof?.role === "staff") {
      const url = request.nextUrl.clone();
      url.pathname = "/pos/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Admin login: send staff to POS, admin to dashboard, customer away
  if (user && path === "/admin/login") {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const url = request.nextUrl.clone();
    if (prof?.role === "staff") {
      url.pathname = "/pos/dashboard";
      return NextResponse.redirect(url);
    }
    if (prof?.role === "customer") {
      url.pathname = "/customer/profile";
      return NextResponse.redirect(url);
    }
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // POS login: already logged-in operators go to dashboard; customers out
  if (user && path === "/pos/login") {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (prof?.role === "customer") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    if (prof?.role === "admin" || prof?.role === "staff") {
      const url = request.nextUrl.clone();
      url.pathname = "/pos/dashboard";
      return NextResponse.redirect(url);
    }
  }
  if (!user && path.startsWith("/customer/profile")) {
    const url = request.nextUrl.clone();
    url.pathname = "/customer/login";
    url.searchParams.set(
      "next",
      `${path}${request.nextUrl.search || ""}`,
    );
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
