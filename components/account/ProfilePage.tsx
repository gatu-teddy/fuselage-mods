'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { friendlyError, supabaseOrNull, useAccount } from './AccountProvider'
import SignInForm from '@/components/auth/SignInForm'
import ProfileView from '@/components/sellers/ProfileView'
import PageHeader from '@/components/layouts/PageHeader'
import { FooterContent } from '@/components/layouts/Footer'
import { getBuyerPosts, getSellerReels, getSellerTags, MOCK_BUYERS, MOCK_SELLERS } from '@/components/sellers/data'

const BIO_MAX = 280
export const HANDLE_RE = /^[a-z0-9_.]{3,20}$/
export const inputClass =
  'w-full h-10 px-3 rounded-lg text-sm font-normal normal-case tracking-normal text-foreground bg-transparent outline-none border border-border focus:border-primary'
export const fieldLabel = 'flex flex-col gap-1.5 text-[10px] font-semibold tracking-widest uppercase'
const smallButton = 'text-xs font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-80'

/** Mock handles are still served from local data, so don't let real accounts collide with them */
export const isReservedHandle = (h: string) => MOCK_SELLERS.some(s => s.handle === h) || MOCK_BUYERS.some(b => b.handle === h)

export default function ProfilePage() {
  const { status, profile } = useAccount()
  if (status === 'loading') return null
  if (status === 'signed-out') return <Gate><SignInForm onSignedIn={() => {}} title="Sign in or create an account" /></Gate>
  if (!profile?.handle) return <Gate><DetailsForm /></Gate>
  return <MyProfile />
}

// ── Pop-up shell: header + overlay + mobile footer (sign-in and first-time details) ──
function Gate({ children }: { children: ReactNode }) {
  const router = useRouter()
  return (
    <div className="absolute inset-0 bg-background flex flex-col">
      <PageHeader title="Profile" subtitle="Not signed in" />
      <div className="relative flex-1 min-h-0">
        {/* Covers the area below the header, so the header and tab bar stay usable */}
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 p-4 overflow-y-auto"
          style={{ backgroundColor: 'rgba(5,2,6,0.75)', backdropFilter: 'blur(4px)' }}
        >
          {children}
          <button onClick={() => router.push('/browse')} className="text-xs hover:opacity-80" style={{ color: 'rgba(251,255,244,0.4)' }}>
            Not now
          </button>
        </div>
      </div>
      {/* Mobile: footer sits below the pop-up, just above the tab bar (wide layouts use the hover footer) */}
      <footer className="md:hidden flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <FooterContent />
      </footer>
    </div>
  )
}

// ── After first sign-in: name, username, location ──
function DetailsForm() {
  const { profile, refresh } = useAccount()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [handle, setHandle] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Enter your name.')
    if (!HANDLE_RE.test(handle)) return setError('Username: 3–20 lowercase letters, numbers, _ or .')
    if (isReservedHandle(handle)) return setError('That handle is already taken.')
    const supabase = supabaseOrNull()
    if (!supabase || !profile) return setError('Account not found — try signing in again.')
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name.trim(), handle, location: location.trim() || null })
      .eq('id', profile.id)
    setSaving(false)
    if (error) return setError(friendlyError(error) ?? '')
    await refresh()
  }

  return (
    <form
      onSubmit={submit}
      aria-labelledby="details-title"
      className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
      style={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}
    >
      <div>
        <h2 id="details-title" className="text-base font-bold text-foreground">Set up your profile</h2>
        <p className="text-xs mt-1" style={{ color: 'rgba(251,255,244,0.4)' }}>
          This is how you appear when you post mods and save listings.
        </p>
      </div>
      <label className={fieldLabel} style={{ color: 'rgba(251,255,244,0.4)' }}>
        Name
        <input value={name} onChange={e => setName(e.target.value)} autoFocus className={inputClass} />
      </label>
      <label className={fieldLabel} style={{ color: 'rgba(251,255,244,0.4)' }}>
        Username
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm normal-case tracking-normal">@</span>
          <input value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/\s/g, ''))} className={`${inputClass} pl-7`} />
        </div>
      </label>
      <label className={fieldLabel} style={{ color: 'rgba(251,255,244,0.4)' }}>
        Location (optional)
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Dubai, UAE" className={inputClass} />
      </label>
      {error && <p className="text-xs" style={{ color: '#e5866f' }}>{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="h-10 rounded-lg text-xs font-semibold tracking-wide uppercase hover:opacity-90 disabled:opacity-50 bg-primary text-background"
      >
        {saving ? 'Saving…' : 'Continue'}
      </button>
    </form>
  )
}

// ── Signed-in profile (seller details when the user is a seller) ──
function MyProfile() {
  const { profile, seller, refresh } = useAccount()
  const p = profile!
  const [draft, setDraft] = useState<string | null>(null) // null = not editing
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handle = seller?.handle ?? p.handle!
  const currentBio = seller?.bio ?? p.bio ?? ''
  // Real reels arrive with uploads (step 3); until then these come from mock data
  const reels = seller ? getSellerReels(handle) : getBuyerPosts(handle)

  // One bio: kept the same on the profile and, for sellers, the seller record
  const saveBio = async () => {
    const supabase = supabaseOrNull()
    if (!supabase || draft === null) return
    setSaving(true)
    const bio = draft.trim() || null
    const results = await Promise.all([
      supabase.from('profiles').update({ bio }).eq('id', p.id),
      ...(seller ? [supabase.from('sellers').update({ bio }).eq('id', seller.id)] : []),
    ])
    setSaving(false)
    const failed = results.find(r => r.error)?.error ?? null
    if (failed) return setError(friendlyError(failed) ?? '')
    setError('')
    setDraft(null)
    await refresh()
  }

  const bio =
    draft === null ? (
      currentBio || <span style={{ color: 'rgba(251,255,244,0.25)' }}>No bio yet.</span>
    ) : (
      <div className="flex flex-col gap-2">
        <textarea
          autoFocus
          value={draft}
          maxLength={BIO_MAX}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          placeholder={seller ? 'Tell buyers what you build, fit or sell…' : 'Your bike, your mods, your rides…'}
          className="w-full p-3 rounded-lg text-sm text-foreground bg-transparent outline-none resize-none border border-border focus:border-primary"
        />
        <div className="flex items-center gap-2">
          <button onClick={saveBio} disabled={saving} className="text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-80 disabled:opacity-50 bg-primary text-background">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => { setDraft(null); setError('') }} className="text-xs font-medium px-3 py-2 hover:opacity-80">
            Cancel
          </button>
          <span className="ml-auto text-[10px] tabular-nums" style={{ color: 'rgba(251,255,244,0.3)' }}>{draft.length}/{BIO_MAX}</span>
        </div>
        {error && <p className="text-xs" style={{ color: '#e5866f' }}>{error}</p>}
      </div>
    )

  const outline = { border: '1px solid hsl(var(--border))', color: 'rgba(251,255,244,0.7)' }

  return (
    <ProfileView
      name={seller?.display_name ?? p.display_name ?? handle}
      handle={handle}
      location={seller?.location ?? p.location ?? ''}
      verified={seller?.verified}
      bgGradient={['#1a0a00', '#2e1200']}
      bio={bio}
      // Optional socials: ProfileView only shows the ones that are set
      instagram={seller?.instagram ?? undefined}
      tiktok={seller?.tiktok ?? undefined}
      stats={
        seller
          ? [{ label: 'Mods', value: reels.length }, { label: 'Tags', value: getSellerTags(handle) }]
          : [{ label: 'Posts', value: reels.length }]
      }
      actions={
        draft === null && (
          <div className="flex flex-wrap justify-end gap-2">
            <button onClick={() => setDraft(currentBio)} className={smallButton} style={outline}>Edit bio</button>
            {seller ? (
              <Link href={`/sellers/${seller.handle}`} className={smallButton} style={outline}>Public page</Link>
            ) : (
              <Link href="/seller/onboarding" className={`${smallButton} bg-primary text-background`}>
                Become a seller
              </Link>
            )}
            <button onClick={() => supabaseOrNull()?.auth.signOut()} className={smallButton} style={{ color: 'rgba(251,255,244,0.45)' }}>
              Sign out
            </button>
          </div>
        )
      }
      reels={reels}
    />
  )
}
