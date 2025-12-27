import type { SearchAction, SearchState } from '@/types'

export function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      }

    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        currentPage: action.payload,
        searchQuery: '', // Clear search when page changes
      }

    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchQuery: '',
      }

    default:
      return state
  }
}
