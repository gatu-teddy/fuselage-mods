'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

// Signed-in user's profile + seller record from Supabase, shared app-wide.

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  handle: string | null
  bio: string | null
  location: string | null
  role: 'buyer' | 'seller' | 'admin'
}

interface SellerRecord {
  id: string
  handle: string
  display_name: string
  bio: string | null
  location: string | null
  instagram: string | null
  tiktok: string | null
  verified: boolean
}

interface Account {
  status: 'loading' | 'signed-out' | 'signed-in'
  profile: Profile | null
  seller: SellerRecord | null
  /** Re-read profile + seller (after edits) */
  refresh: () => Promise<void>
}

const AccountContext = createContext<Account>({
  status: 'loading',
  profile: null,
  seller: null,
  refresh: async () => {},
})

export const useAccount = () => useContext(AccountContext)

/** Supabase browser client, or null if env vars aren't set (app still runs, signed out) */
export function supabaseOrNull() {
  try {
    return createClient()
  } catch {
    return null
  }
}

export default function AccountProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<Account, 'refresh'>>({ status: 'loading', profile: null, seller: null })

  const load = useCallback(async () => {
    const supabase = supabaseOrNull()
    const user = supabase && (await supabase.auth.getUser()).data.user
    if (!supabase || !user) {
      setState({ status: 'signed-out', profile: null, seller: null })
      return
    }
    const [{ data: profile }, { data: seller }] = await Promise.all([
      supabase.from('profiles').select('id, email, display_name, handle, bio, location, role').eq('id', user.id).maybeSingle(),
      supabase.from('sellers').select('id, handle, display_name, bio, location, instagram, tiktok, verified').eq('user_id', user.id).maybeSingle(),
    ])
    setState({ status: 'signed-in', profile: profile as Profile | null, seller: seller as SellerRecord | null })
  }, [])

  useEffect(() => {
    const supabase = supabaseOrNull()
    // Initial load runs from the auth listener's INITIAL_SESSION event, so no separate call
    if (!supabase) {
      queueMicrotask(load)
      return
    }
    const { data } = supabase.auth.onAuthStateChange(() => { void load() })
    return () => data.subscription.unsubscribe()
  }, [load])

  return <AccountContext.Provider value={{ ...state, refresh: load }}>{children}</AccountContext.Provider>
}

/** Turn Supabase errors into something a user can act on */
export function friendlyError(error: { code?: string; message: string } | null) {
  if (!error) return null
  if (error.code === '23505') return 'That handle is already taken.'
  return error.message
}

/** Accept "@name", "name" or a full link for Instagram / TikTok; empty → null */
export function socialUrl(platform: 'instagram' | 'tiktok', value: string) {
  const v = value.trim()
  if (!v) return null
  if (/^https?:\/\//i.test(v)) return v
  const handle = v.replace(/^@/, '')
  return platform === 'instagram' ? `https://instagram.com/${handle}` : `https://www.tiktok.com/@${handle}`
}
