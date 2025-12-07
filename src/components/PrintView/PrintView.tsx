import React from 'react'
import { createPortal } from 'react-dom'

import { isTesting } from '@/utils/constants'

export const PrintView = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      {children}
      {!isTesting
        ? createPortal(<div className="print-view">{children}</div>, document.body)
        : null}
    </>
  )
}
