import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Renamed from Middleware to Proxy in this Next.js version. Same
// NextRequest/NextResponse/matcher API as before.
export async function proxy(request: NextRequest) {
  // Server Actions re-verify auth via lib/dal.ts (getUser/verifySession)
  // the instant they run, which refreshes the session cookie the same way
  // updateSession() does. Running updateSession() here too would just add a
  // second, redundant Supabase Auth network round trip to every mutation
  // (task toggle, task create, ...) for a redirect decision the action
  // doesn't need — it self-redirects via lib/dal.ts if unauthenticated.
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
