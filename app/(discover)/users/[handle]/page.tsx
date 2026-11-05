import { notFound } from 'next/navigation'
import { getBuyerPosts } from '@/components/sellers/data'
import { findBuyer } from '@/components/sellers/lookup'
import BuyerPage from '@/components/sellers/BuyerPage'

interface Props {
  params: Promise<{ handle: string }>
}

export default async function Page({ params }: Props) {
  const { handle } = await params
  const buyer = await findBuyer(decodeURIComponent(handle))
  if (!buyer) notFound()
  return <BuyerPage buyer={buyer} posts={getBuyerPosts(buyer.handle)} />
}
