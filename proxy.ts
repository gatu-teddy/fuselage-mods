import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next 16 proxy (formerly middleware): refreshes the Supabase session cookie on every
// request and guards protected routes. Logic lives in lib/supabase/middleware.ts.
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Skip static assets and images
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
