import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

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
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicPaths = ["/login", "/register", "/pending", "/error"];
  if (
    !user &&
    !publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && !request.nextUrl.pathname.startsWith("/pending")) {
    const { data: approval } = await supabase
      .from("user_approvals")
      .select("status")
      .eq("user_id", user.id)
      .single();

    if (approval?.status === "pending") {
      return NextResponse.redirect(new URL("/pending", request.url));
    }

    if (approval?.status === "rejected") {
      return NextResponse.redirect(new URL("/error", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
