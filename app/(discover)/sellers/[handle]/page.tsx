import { notFound } from 'next/navigation'
import { findSeller } from '@/components/sellers/lookup'
import SellerPage from '@/components/sellers/SellerPage'

interface Props {
  params: Promise<{ handle: string }>
}

export default async function Page({ params }: Props) {
  const { handle } = await params
  const seller = await findSeller(decodeURIComponent(handle))
  if (!seller) notFound()
  return <SellerPage seller={seller} />
}
