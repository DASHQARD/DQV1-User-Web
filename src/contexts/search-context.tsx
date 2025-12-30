import React, { useCallback, useMemo } from 'react'

import type { PageType, SearchState } from '@/types'

import { searchReducer } from './search-reducer'
import { SearchContext } from './search-context-value'

const initialState: SearchState = {
  searchQuery: '',
  currentPage: 'Dashboard',
}

// Context Provider Component
export function SearchProvider({ children }: Readonly<React.PropsWithChildren>) {
  const [state, dispatch] = React.useReducer(searchReducer, initialState)

  const setSearchQuery = useCallback(
    (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
    },
    [dispatch],
  )

  const setCurrentPage = useCallback(
    (page: PageType) => {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page })
    },
    [dispatch],
  )

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' })
  }, [dispatch])

  return (
    <SearchContext.Provider
      value={useMemo(
        () => ({
          state,
          setSearchQuery,
          setCurrentPage,
          clearSearch,
        }),
        [state, setSearchQuery, setCurrentPage, clearSearch],
      )}
    >
      {children}
    </SearchContext.Provider>
  )
}
