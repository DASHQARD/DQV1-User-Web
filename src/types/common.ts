export type FeaturedCardProps = {
  title: string
  subtitle?: string
  imageUrl: string
  rating: number
  reviews: number
  qrUrl: string
  price?: number
  category?: string
  type?: 'dashx' | 'dashpro' | 'dashgo'
}

export type VendorItemProps = {
  name: string
  shops?: number
  rating?: number
}
