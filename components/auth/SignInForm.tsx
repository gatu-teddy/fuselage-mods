'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Step = 'email' | 'otp'

interface Props {
  /** Where to land after signing in (also used by email links + Google) */
  next?: string
  /** Embedded use (e.g. the profile pop-up): stay on the page; the account provider picks up the session */
  onSignedIn?: () => void
  title?: string
}

export default function SignInForm({ next = '/profile', onSignedIn, title = 'Sign in' }: Props) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Client is created on use (not during render), so the page still renders before
  // Supabase env vars exist. The browser client is a singleton, so this is cheap.
  const auth = () => createClient().auth
  // Email links and Google come back through /auth/callback, then on to `next`
  const callbackUrl = () => `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`

  async function sendOtp() {
    setLoading(true)
    setError(null)
    const { error } = await auth().signInWithOtp({ email, options: { emailRedirectTo: callbackUrl() } })
    setLoading(false)
    if (error) { setError(error.message); return }
    setStep('otp')
  }

  async function verifyOtp() {
    setLoading(true)
    setError(null)
    const { error } = await auth().verifyOtp({
      email,
      token: otp,
      type: 'email',
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    if (onSignedIn) onSignedIn()
    else window.location.href = next
  }

  async function signInWithGoogle() {
    await auth().signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl() },
    })
  }

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
      style={{ backgroundColor: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}
    >
      {/* Logo / wordmark */}
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
          Fuselage Mods
        </p>
        <h1 className="mt-1 text-xl font-semibold text-foreground">
          {step === 'otp' ? 'Check your email' : title}
        </h1>
        {step === 'otp' && (
          <p className="mt-1 text-sm" style={{ color: 'rgba(251,255,244,0.5)' }}>
            Enter the 6-digit code sent to {email}, or tap the link in the email
          </p>
        )}
      </div>

      {step === 'email' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-wide uppercase" style={{ color: 'rgba(251,255,244,0.4)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendOtp()}
              placeholder="you@example.com"
              className="w-full h-11 rounded-lg px-4 text-sm text-foreground bg-background outline-none focus:ring-1"
              style={{ border: '1px solid hsl(var(--border))', '--tw-ring-color': 'hsl(var(--primary))' } as React.CSSProperties}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={sendOtp}
            disabled={loading || !email}
            className="h-11 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-40 bg-primary text-background"
          >
            {loading ? 'Sending…' : 'Send code'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: 'hsl(var(--border))' }} />
            <span className="text-xs" style={{ color: 'rgba(251,255,244,0.3)' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'hsl(var(--border))' }} />
          </div>

          <button
            onClick={signInWithGoogle}
            className="h-11 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
            style={{ border: '1px solid hsl(var(--border))', color: 'rgba(251,255,244,0.7)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-wide uppercase" style={{ color: 'rgba(251,255,244,0.4)' }}>
              6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && verifyOtp()}
              placeholder="000000"
              className="w-full h-11 rounded-lg px-4 text-sm text-foreground bg-background outline-none focus:ring-1 tracking-[0.3em] text-center"
              style={{ border: '1px solid hsl(var(--border))', '--tw-ring-color': 'hsl(var(--primary))' } as React.CSSProperties}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={verifyOtp}
            disabled={loading || otp.length < 6}
            className="h-11 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-40 bg-primary text-background"
          >
            {loading ? 'Verifying…' : 'Verify code'}
          </button>

          <button
            onClick={() => { setStep('email'); setOtp(''); setError(null) }}
            className="text-xs text-center hover:underline"
            style={{ color: 'rgba(251,255,244,0.4)' }}
          >
            Use a different email
          </button>
        </>
      )}
    </div>
  )
}
