import SignInForm from '@/components/auth/SignInForm'

interface Props {
  searchParams: Promise<{ next?: string }>
}

// Protected pages redirect here with ?next=<page>; sign-in returns there
export default async function SignInPage({ searchParams }: Props) {
  const { next } = await searchParams
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : '/profile'
  return (
    <div className="absolute inset-0 bg-background flex items-center justify-center p-6">
      <SignInForm next={safeNext} />
    </div>
  )
}
