// ==========================================================================
// Asigna un id anónimo (`mft_uid`) al visitante si aún no lo tiene.
// Sirve para contar el uso del plan gratis sin necesidad de login.
// En producción, con Supabase Auth, este id lo da la sesión del usuario.
// ==========================================================================
import { NextResponse, type NextRequest } from "next/server";
import { UID_COOKIE } from "@/lib/user";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get(UID_COOKIE)) {
    const uid = crypto.randomUUID();
    response.cookies.set(UID_COOKIE, uid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 año
    });
  }
  return response;
}

export const config = {
  // Aplica a todo menos assets estáticos.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
