import React from 'react'

import type { SearchContextType, SearchState } from '@/types'

import { searchReducer } from './search-reducer'

export const SearchContext = React.createContext<SearchContextType | undefined>(undefined)

export const initialState: SearchState = {
  searchQuery: '',
  currentPage: 'Dashboard',
}

export { searchReducer }
