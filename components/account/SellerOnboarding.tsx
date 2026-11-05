'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/layouts/PageHeader'
import { friendlyError, socialUrl, supabaseOrNull, useAccount } from './AccountProvider'
import { fieldLabel, HANDLE_RE, inputClass, isReservedHandle } from './ProfilePage'

const labelStyle = { color: 'rgba(251,255,244,0.4)' }

/** "Become a seller": creates the seller record. Socials are optional (no buttons shown if blank). */
export default function SellerOnboarding() {
  const { status, profile, seller } = useAccount()
  if (status === 'loading') return null

  return (
    <div className="absolute inset-0 bg-background flex flex-col">
      <PageHeader title="Become a seller" subtitle="Set up your seller page" backHref="/profile" />
      <div className="flex-1 min-h-0 overflow-y-auto">
        {seller ? (
          <div className="flex flex-col items-center gap-3 pt-24 px-6 text-center">
            <p className="text-sm text-foreground">You&apos;re already a seller as @{seller.handle}.</p>
            <Link href="/profile" className="text-xs font-semibold text-primary">Go to your profile</Link>
          </div>
        ) : !profile?.handle ? (
          <div className="flex flex-col items-center gap-3 pt-24 px-6 text-center">
            <p className="text-sm text-foreground">Finish setting up your profile first.</p>
            <Link href="/profile" className="text-xs font-semibold text-primary">Go to your profile</Link>
          </div>
        ) : (
          <OnboardingForm />
        )}
      </div>
    </div>
  )
}

function OnboardingForm() {
  const router = useRouter()
  const { profile, refresh } = useAccount()
  const p = profile!
  const [form, setForm] = useState({
    name: p.display_name ?? '',
    handle: p.handle ?? '',
    location: p.location ?? '',
    bio: p.bio ?? '',
    instagram: '',
    tiktok: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: k === 'handle' ? e.target.value.toLowerCase().replace(/\s/g, '') : e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Enter your business name.')
    if (!HANDLE_RE.test(form.handle)) return setError('Seller handle: 3–20 lowercase letters, numbers, _ or .')
    if (isReservedHandle(form.handle)) return setError('That handle is already taken.')
    const supabase = supabaseOrNull()
    if (!supabase) return setError('Sign-in service unavailable — try again later.')
    setSaving(true)
    const { error } = await supabase.from('sellers').insert({
      user_id: p.id,
      handle: form.handle,
      display_name: form.name.trim(),
      location: form.location.trim() || null,
      bio: form.bio.trim() || null,
      instagram: socialUrl('instagram', form.instagram),
      tiktok: socialUrl('tiktok', form.tiktok),
    })
    setSaving(false)
    if (error) return setError(friendlyError(error) ?? '')
    await refresh() // role becomes 'seller' via the database trigger
    router.push('/profile')
  }

  const field = (label: string, key: keyof typeof form, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className={fieldLabel} style={labelStyle}>
      {label}
      <input value={form[key]} onChange={set(key)} className={inputClass} {...extra} />
    </label>
  )

  return (
    <form onSubmit={submit} className="w-full max-w-md mx-auto flex flex-col gap-4 p-5 pb-16">
      <p className="text-xs" style={{ color: 'rgba(251,255,244,0.45)' }}>
        Your seller page is where buyers see your listings, your Tags and how to reach you.
      </p>
      {field('Business name', 'name', { autoFocus: true, placeholder: 'e.g. Moto Workshop NBI' })}
      <label className={fieldLabel} style={labelStyle}>
        Seller handle
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm normal-case tracking-normal">@</span>
          <input value={form.handle} onChange={set('handle')} className={`${inputClass} pl-7`} />
        </div>
        <span className="normal-case tracking-normal font-normal" style={{ color: 'rgba(251,255,244,0.3)' }}>
          Your page: /sellers/{form.handle || 'handle'} — can&apos;t be changed later
        </span>
      </label>
      {field('Location (optional)', 'location', { placeholder: 'e.g. Dubai, UAE' })}
      <label className={fieldLabel} style={labelStyle}>
        Bio (optional)
        <textarea value={form.bio} onChange={set('bio')} rows={3} maxLength={280}
          placeholder="What you build, fit or sell…"
          className="w-full p-3 rounded-lg text-sm font-normal normal-case tracking-normal text-foreground bg-transparent outline-none resize-none border border-border focus:border-primary" />
      </label>
      {field('Instagram (optional)', 'instagram', { placeholder: '@yourhandle or link' })}
      {field('TikTok (optional)', 'tiktok', { placeholder: '@yourhandle or link' })}
      {error && <p className="text-xs" style={{ color: '#e5866f' }}>{error}</p>}
      <button type="submit" disabled={saving}
        className="h-11 rounded-lg text-xs font-semibold tracking-wide uppercase hover:opacity-90 disabled:opacity-50 bg-primary text-background">
        {saving ? 'Creating…' : 'Create seller page'}
      </button>
    </form>
  )
}
