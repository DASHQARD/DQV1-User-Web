import { parseAsInteger, useQueryState } from 'nuqs'

export function useVendorsFilters() {
  // const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10))
  const [search, setSearch] = useQueryState('search')
  const [vendor_id, setVendorId] = useQueryState('vendor_id')
  const [branch_type, setBranchType] = useQueryState('branch_type')
  const [is_single_branch, setIsSingleBranch] = useQueryState('is_single_branch')
  const [parent_branch_id, setParentBranchId] = useQueryState('parent_branch_id')
  const [card_type, setCardType] = useQueryState('card_type')
  const [card_id, setCardId] = useQueryState('card_id')
  const [date_from, setDateFrom] = useQueryState('date_from')
  const [date_to, setDateTo] = useQueryState('date_to')
  const [min_price, setMinPrice] = useQueryState('min_price')
  const [max_price, setMaxPrice] = useQueryState('max_price')
  const [status, setStatus] = useQueryState('status')

  // const withResetPage = useCallback(
  //   <T extends (...args: any[]) => any>(setter: T) => {
  //     return (...args: Parameters<T>) => {
  //       setPage(1)
  //       setter(...args)
  //     }
  //   },
  //   [setPage],
  // )

  return {
    // page,
    // setPage,
    limit,
    setLimit,
    search,
    setSearch,
    vendor_id,
    setVendorId,
    branch_type,
    setBranchType,
    is_single_branch,
    setIsSingleBranch,
    parent_branch_id,
    setParentBranchId,
    card_type,
    setCardType,
    card_id,
    setCardId,
    date_from,
    setDateFrom,
    date_to,
    setDateTo,
    min_price,
    setMinPrice,
    max_price,
    setMaxPrice,
    status,
    setStatus,
  }
}
