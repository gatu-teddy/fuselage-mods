import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Routes that need a signed-in user. Matched as whole path segments, so '/seller'
// covers '/seller' and '/seller/…' but not the public '/sellers/<handle>' pages.
const PROTECTED = ['/seller', '/buyer', '/admin']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Until Supabase is configured, skip auth instead of crashing every request
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return response

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(`${p}/`))

  if (isProtected && !user) {
    // Come back here after signing in
    const signIn = new URL('/sign-in', request.url)
    signIn.searchParams.set('next', pathname)
    return NextResponse.redirect(signIn)
  }

  return response
}
