import { useContext } from 'react'

import { SearchContext } from '@/contexts/search-context'
import type { SearchContextType } from '@/types'

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}
