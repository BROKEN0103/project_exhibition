import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vault-secure-platform-access-token-secret-2026"
)

// In the new architecture, the access token should normally be in the Authorization header.
// However, for Next.js middleware to work on SSR pages, we might need a cookie for the access token too,
// OR have the middleware check the refresh token cookie (though that's not ideal for access control).
// Production standard: HttpOnly Refresh Token, in-memory Access Token.
// For SSR, we often use a temporary short-lived secure cookie for the access token.

const ACCESS_TOKEN_COOKIE = "accessToken"
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup"]
const AUTH_ROUTES = ["/auth/login", "/auth/signup"]

async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  const payload = token ? await verifyToken(token) : null
  const isAuthenticated = !!payload

  // If authenticated user tries to visit auth pages, redirect to dashboard
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname === r)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If unauthenticated user tries to visit protected routes, redirect to login
  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r)
  const isAsset = pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")

  if (!isAuthenticated && !isPublic && !isAsset) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
