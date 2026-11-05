import { notFound } from 'next/navigation'
import { resolveListing } from '@/components/explore/data'
import { getSellerByHandle } from '@/components/sellers/data'
import SellerPage from '@/components/sellers/SellerPage'
import ListingHero from '@/components/sellers/ListingHero'

interface Props {
  params: Promise<{ handle: string; id: string }>
}

// A listing lives on the fitting seller's profile: listing on top, the seller's posts below
export default async function Page({ params }: Props) {
  const { handle, id } = await params
  const seller = getSellerByHandle(handle)
  const found = resolveListing(decodeURIComponent(id))
  if (!seller || !found || found.shown.seller.handle !== `@${handle}`) notFound()

  const { shown, listing } = found
  return (
    <SellerPage
      seller={seller}
      top={<ListingHero shown={shown} listing={listing} seller={seller} />}
      // From a buyer's reel, Back goes to that buyer's page (whose Back goes to Explore)
      backHref={shown.author ? `/users/${shown.author.handle.replace('@', '')}` : undefined}
    />
  )
}
