import { Ratelimit } from "@upstash/ratelimit"
import { kv } from "@vercel/kv"
import { auth } from "@/server/auth"
import { NextResponse } from "next/server"

// 16 req/min: sign-up consumes 2 tokens per attempt (POST /sign-up + POST
// /api/auth/callback/credentials), so the effective user-visible limit is ~8
// sign-up attempts or ~16 sign-in attempts per IP per minute.
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(16, "1 m"),
  analytics: false, // keep free-tier usage low
})

export default auth(async (req) => {
  const { pathname } = req.nextUrl

  // Rate limit auth endpoints (POST only — GET requests are page renders)
  const isAuthPost =
    (pathname === "/api/auth/callback/credentials" ||
      pathname === "/sign-up") &&
    req.method === "POST"

  if (isAuthPost) {
    // Prefer x-real-ip (set by Vercel to the real client IP).
    // Fall back to the last entry of x-forwarded-for, which is less
    // attacker-controllable than the first. If no IP can be determined,
    // skip rate limiting (fail open) rather than sharing one bucket across
    // all unidentifiable clients.
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
      null

    if (ip) {
      try {
        const { success } = await ratelimit.limit(`auth:${ip}`)
        if (!success) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429, headers: { "Retry-After": "60" } }
          )
        }
      } catch {
        // KV unavailable — fail open, do not block auth
      }
    }
  }

  const isLoggedIn = !!req.auth

  // API routes: return 401 instead of redirecting (AC #3)
  // Use exact match + prefix to avoid over-matching /api/notesadmin etc.
  const isApiPrivateRoute =
    pathname === "/api/notes" ||
    pathname.startsWith("/api/notes/") ||
    pathname === "/api/trash" ||
    pathname.startsWith("/api/trash/")

  if (isApiPrivateRoute && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Page routes: redirect to sign-in with callbackUrl (AC #1, #2)
  const isPrivatePage =
    pathname.startsWith("/notes") ||
    pathname.startsWith("/trash") ||
    pathname.startsWith("/profile")

  if (isPrivatePage && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search)
    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${callbackUrl}`, req.nextUrl.origin)
    )
  }
})

export const config = {
  matcher: [
    "/notes",
    "/notes/:path*",
    "/trash",
    "/trash/:path*",
    "/profile",
    "/api/notes",
    "/api/notes/:path*",
    "/api/trash",
    "/api/trash/:path*",
    "/api/auth/callback/credentials", // rate limit sign-in
    "/sign-up",                        // rate limit sign-up
  ],
}
