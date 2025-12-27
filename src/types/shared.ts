import type { Tag } from '@/components'
import type { DEFAULT_QUERY } from '@/utils/constants'

import type { IconNames } from './icon-names'

import type { PageType } from './search'

export type DropdownOption = {
  label: string
  value: string
}

export type MenuItem = {
  label: string
  children: {
    icon: IconNames
    name: PageType
    path: string
    // permission: PermissionType
  }[]
}

export type QueryType = typeof DEFAULT_QUERY
export type Func = (...args: any[]) => any

export type TableCellProps<T extends Record<string, any> = { id: string }> = Readonly<{
  getValue: () => any
  row: {
    original: {
      id: string
      [key: string]: any
    } & T
  }
}>

export interface PersistedModalStateOptions {
  paramName?: string // URL parameter name (default: 'modal')
  defaultValue?: string | null // Default modal state
  resetOnRouteChange?: boolean // Reset modal when route changes (default: false)
}

export interface PersistedModalStateReturn<TModalData = unknown> {
  modalState: string | null
  modalData: TModalData | null
  openModal: (modalName: string, data?: TModalData) => void
  closeModal: () => void
  isModalOpen: (modalName?: string) => boolean
}

export interface ConfirmModalStateReturn {
  accept?: Func
  reject?: Func
  confirmAction: () => Promise<boolean>
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export type RoleStatus = 'active' | 'inactive' | 'deactivated' | 'deactivate'

export type Role = {
  id: string
  name: string
  description: string
  permissions: string[]
  admins: any[]
  admin_count: number
  status: RoleStatus
  created_at: string
  updated_at: string
}

export const TagVariants: Record<string, React.ComponentProps<typeof Tag>['variant']> = {
  active: 'success',
  inactive: 'error',
  deactivated: 'error',
  deactivate: 'error',
  neutral: undefined,
  approved: 'success',
  pending: 'warning',
  reviewed: 'warning',
  declined: 'error',
  rejected: 'error',
  paid: 'success',
  running: 'success',
  sent: 'success',
  completed: 'success',
  failed: 'error',
  'pending approval': 'warning',
  draft: 'warning',
}

export type NativeEventHandler = (e: Event & { target: HTMLInputElement }) => void

export type FileType = {
  id: string
  file_name: string
  file_type: string
  file_url: string
  uploaded_at: string
  status: string
}

export type TierType = '1' | '2' | '3' | 'M1' | 'M2' | 'M3' | 'A1' | 'A2' | 'A3'

export type OptionsConfigType = {
  hasView?: boolean
  hasDelete?: boolean
  hasActivate?: boolean
  hasDeactivate?: boolean
  hasFreeze?: boolean
  hasUnfreeze?: boolean
  hasUpdateProfile?: boolean
  hasClose?: boolean
  hasRestore?: boolean
}

export type generateCsvParams = {
  headers: Array<CsvHeader>
  data: Array<any>
  separator?: string
  fileName?: string
}

export type CsvHeader = {
  name: string
  accessor: string
  transform?: (v: any) => string
}
