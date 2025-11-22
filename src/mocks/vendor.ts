export type Vendor = {
  id: number
  title: string
  brand: string
  brandLogo?: string
  currency: string
  currencySymbol: string
  currencyIcon?: string
  currentPrice: number
  originalPrice?: number
  discount?: number
  salesCount: number
  isPromoted?: boolean
  region?: string
  description?: string
}

export const VENDOR_MOCKS: Vendor[] = [
  {
    id: 1,
    title: 'Valorant 2.5 EUR (225 VP) | Euro Area',
    brand: 'Valorant',
    brandLogo: 'https://cdn.bsvmarket.com/images/product-images/Games-Valorant.png',
    currency: 'EUR',
    currencySymbol: '€',
    currentPrice: 2.81,
    originalPrice: 2.89,
    discount: 3,
    salesCount: 43558,
    isPromoted: true,
    region: 'Euro Area',
  },
  {
    id: 2,
    title: 'ExitLag Codes 10 USD | United States',
    brand: 'ExitLag',
    brandLogo: 'https://cdn.bsvmarket.com/images/product-images/exitLag-codes.png',
    currency: 'USD',
    currencySymbol: '$',
    currentPrice: 9.5,
    originalPrice: 10,
    discount: 5,
    salesCount: 128934,
    isPromoted: false,
    region: 'United States',
  },
  {
    id: 3,
    title: 'PlayStation Network 20 GBP | United Kingdom',
    brand: 'PlayStation',
    brandLogo:
      'https://cdn.bsvmarket.com/images/product-images/Gift_cards-PlayStation_network_aka_psn.png',
    currency: 'GBP',
    currencySymbol: '£',
    currentPrice: 18.99,
    originalPrice: 20,
    discount: 5,
    salesCount: 67890,
    isPromoted: true,
    region: 'United Kingdom',
  },
  {
    id: 4,
    title: 'Roblox 50 USD | Global',
    brand: 'Roblox',
    brandLogo: 'https://cdn.bsvmarket.com/images/product-images/Gift_cards-Roblox.png',
    currency: 'USD',
    currencySymbol: '$',
    currentPrice: 47.5,
    originalPrice: 50,
    discount: 5,
    salesCount: 234567,
    isPromoted: false,
    region: 'Global',
  },
  {
    id: 5,
    title: 'Steam Gift Cards 25 USD | United States',
    brand: 'Steam',
    brandLogo: 'https://cdn.bsvmarket.com/images/product-images/Gift_cards-Steam_Gift_Cards.png',
    currency: 'USD',
    currencySymbol: '$',
    currentPrice: 23.75,
    originalPrice: 25,
    discount: 4,
    salesCount: 98765,
    isPromoted: true,
    region: 'United States',
  },
  {
    id: 6,
    title: 'Xbox Gift Cards 15 EUR | Euro Area',
    brand: 'Xbox',
    brandLogo: 'https://cdn.bsvmarket.com/images/product-images/Gift_cards-Xbox.png',
    currency: 'EUR',
    currencySymbol: '€',
    currentPrice: 14.25,
    originalPrice: 15,
    discount: 5,
    salesCount: 156789,
    isPromoted: false,
    region: 'Euro Area',
  },
  {
    id: 7,
    title: 'Perplexity Plus Subscription 30 USD | United States',
    brand: 'Perplexity',
    brandLogo: 'https://cdn.bsvmarket.com/images/product-images/perplexity-subscriptions.png',
    currency: 'USD',
    currencySymbol: '$',
    currentPrice: 28.5,
    originalPrice: 30,
    discount: 5,
    salesCount: 87654,
    isPromoted: true,
    region: 'United States',
  },
  {
    id: 8,
    title: 'Tinder Gift Cards 10 USD | Global',
    brand: 'Tinder',
    brandLogo:
      'https://cdn.bsvmarket.com/images/product-images/entertainment-tinder-gift-cards.png',
    currency: 'USD',
    currencySymbol: '$',
    currentPrice: 9.75,
    originalPrice: 10,
    discount: 2.5,
    salesCount: 345678,
    isPromoted: false,
    region: 'Global',
  },
]

export const PARTNER_VENDORS_MOCKS = [
  { name: 'Aqua Safari', shops: 13, rating: 4.5 },
  { name: 'Sky Lounge', shops: 13, rating: 4.5 },
  { name: 'Urban Spa', shops: 13, rating: 4.5 },
  { name: 'Tech Haven', shops: 13, rating: 4.5 },
  { name: 'Green Grocer', shops: 13, rating: 4.5 },
  { name: 'Fashion Hub', shops: 13, rating: 4.5 },
  { name: 'Coffee Corner', shops: 13, rating: 4.5 },
  { name: 'Book Nook', shops: 13, rating: 4.5 },
]
