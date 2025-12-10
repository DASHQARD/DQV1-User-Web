import { useCards, useVendorsFilters } from '../..'

export default function useVendorsManagementBase() {
  const { limit, min_price, max_price, setMinPrice, setMaxPrice, search, setSearch } =
    useVendorsFilters()
  const { usePublicCardsService } = useCards()
  const { data: cardsResponse } = usePublicCardsService({ limit, search })

  const cardTabs = [
    { id: 'dashx', label: 'DashX' },
    { id: 'dashgo', label: 'DashGo' },
    { id: 'dashpro', label: 'DashPro' },
    { id: 'dashpass', label: 'DashPass' },
  ]

  const priceRanges = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $250', min: 100, max: 250 },
    { label: '$250+', min: 250, max: null },
  ]

  const sortOptions = [
    { label: 'Most Popular', value: 'popular' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Highest Rated', value: 'rating' },
  ]

  return {
    cardsResponse,
    min_price,
    max_price,
    setMinPrice,
    setMaxPrice,
    search,
    setSearch,
    cardTabs,
    priceRanges,
    sortOptions,
  }
}
