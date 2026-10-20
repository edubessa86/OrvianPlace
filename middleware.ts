import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Rotas de automação são autenticadas pelo próprio endpoint via CRON_SECRET.
  // Não exigir sessão Supabase aqui; a rota rejeita requisições sem Bearer válido.
  if (request.nextUrl.pathname === "/api/cron/orvian-trends") {
    return NextResponse.next();
  }

  // Loja pública: a página inicial deve ser acessível sem autenticação.
  // As demais rotas continuam protegidas pelo fluxo administrativo abaixo.
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const loginUrl = new URL("/login", request.url);

  if (!url || !anonKey) {
    loginUrl.searchParams.set("reason", "config");
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: Parameters<typeof response.cookies.set>[2];
        }>,
      ) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/access-denied") {
      return response;
    }
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    if (request.nextUrl.pathname === "/access-denied") return response;
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  if (request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
