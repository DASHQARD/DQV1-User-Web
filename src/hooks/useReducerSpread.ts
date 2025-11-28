import React from 'react'

export function useReducerSpread<T extends Record<string, any>>(initialArg: T) {
  const spreadReducer = (state: T, action: Partial<T>) => ({
    ...state,
    ...action,
  })
  const [state, setState] = React.useReducer(spreadReducer, { ...initialArg }, () => ({
    ...initialArg,
  }))

  return [state, setState] as const
}
