import TabBar from '@/components/layouts/TabBar'
import { SiteFooter } from '@/components/layouts/Footer'
import AccountProvider from '@/components/account/AccountProvider'

// Shared shell for every page: pages fill the area above the footer (wide layouts) /
// mobile tab bar, and both stay mounted while navigating.
export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <div className="fixed inset-0 flex flex-col bg-background">
        <div className="relative flex-1 min-h-0">
          {children}
        </div>
        <SiteFooter />
        <TabBar />
      </div>
    </AccountProvider>
  )
}
