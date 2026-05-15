import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase auth middleware.
 *
 * Responsibilities:
 *   1. Refresh the Supabase session on every matched request.
 *   2. Gate /admin/* behind admin-only auth.
 *   3. Gate /protected/* behind auth, with per-project authorization
 *      (admin OR the client matched to the project's slug).
 *   4. Redirect logged-in users away from /login.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT run any other code between createServerClient
  // and supabase.auth.getUser(). A simple mistake could make your
  // application vulnerable to security issues.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");
  const isAuthRoute = path === "/login";
  const isProtectedRoute = path.startsWith("/protected/");

  const adminEmail = process.env.ADMIN_EMAIL;

  // 1. Require auth for /admin and /protected
  if (!user && (isAdminRoute || isProtectedRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // 2. Admin-only check for /admin
  if (isAdminRoute && user && user.email !== adminEmail) {
    const url = request.nextUrl.clone();
    url.pathname = "/projects";
    return NextResponse.redirect(url);
  }

  // 3. Per-project authorization for /protected/p/{slug}/*
  if (isProtectedRoute && user) {
    const slugMatch = path.match(/^\/protected\/p\/([^/]+)/);
    if (slugMatch) {
      const slug = slugMatch[1];
      const isAdmin = user.email === adminEmail;

      if (!isAdmin) {
        // Look up project to confirm the user is the assigned client.
        // RLS will return null if the user is not the matching client.
        const { data: project } = await supabase
          .from("projects")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (!project) {
          const url = request.nextUrl.clone();
          url.pathname = "/projects";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  // 4. Send logged-in users hitting /login back to their dashboard
  if (isAuthRoute && user) {
    const redirectTo =
      request.nextUrl.searchParams.get("redirect") || "/projects";
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
