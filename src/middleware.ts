import { auth } from "@/server/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth

  const { pathname } = req.nextUrl

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
    pathname.startsWith("/trash")

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
    "/api/notes",
    "/api/notes/:path*",
    "/api/trash",
    "/api/trash/:path*",
  ],
}
