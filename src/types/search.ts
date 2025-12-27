export type PageType =
  | 'Dashboard'
  | 'Transactions'
  | 'Savings Management'
  | 'Loans Management'
  | 'Customers Management'
  | 'Agents Management'
  | 'Merchants Management'
  | 'KYC Management'
  | 'Admin Management'
  | 'Audit Trail'
  | 'Notifications'
  | 'Settings'

export interface SearchState {
  searchQuery: string
  currentPage: PageType
}

export interface SearchContextType {
  state: SearchState
  setSearchQuery: (query: string) => void
  setCurrentPage: (page: PageType) => void
  clearSearch: () => void
}

export type SearchAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: PageType }
  | { type: 'CLEAR_SEARCH' }
