import { useCallback, useEffect, useState } from 'react'
import { useToast, useCountriesData } from '@/hooks'
import { buildBranchDetailsPatch } from '@/features/dashboard/utils/buildBranchDetailsPatch'
import type { Branch } from '@/utils/schemas'
import { UpdateBranchDetailsFormSchema } from '@/utils/schemas/vendor/branches'
import { useBranchMutations } from './useBranchMutatation'
import type { BranchInfoResponse } from '../services'

export type BranchDetailsFieldKey = 'branch_name' | 'branch_location' | 'branch_phone' | 'branch_email'

export const BRANCH_DETAILS_UPDATABLE_FIELDS: { key: BranchDetailsFieldKey; label: string }[] = [
  { key: 'branch_name', label: 'Branch name' },
  { key: 'branch_location', label: 'Branch location' },
  { key: 'branch_phone', label: 'Branch phone' },
  { key: 'branch_email', label: 'Branch email' },
]

const INITIAL_FIELDS: Record<BranchDetailsFieldKey, boolean> = {
  branch_name: false,
  branch_location: false,
  branch_phone: false,
  branch_email: false,
}

const INITIAL_PROPOSED: Record<BranchDetailsFieldKey, string> = {
  branch_name: '',
  branch_location: '',
  branch_phone: '',
  branch_email: '',
}

function branchRowToBranch(branchRow: BranchInfoResponse['data']['branch'] | undefined): Branch | null {
  if (!branchRow) return null
  return {
    id: branchRow.id,
    user_id: String(branchRow.user_id),
    branch_manager_name: branchRow.branch_manager_name,
    branch_manager_email: branchRow.branch_manager_email,
    branch_name: branchRow.branch_name,
    branch_location: branchRow.branch_location,
    branch_phone: (branchRow as { branch_phone?: string }).branch_phone ?? '',
    branch_email: (branchRow as { branch_email?: string }).branch_email ?? '',
    is_single_branch: branchRow.is_single_branch,
    created_at: branchRow.created_at,
    updated_at: branchRow.updated_at,
    vendor_id: String(branchRow.vendor_id),
    full_branch_id: branchRow.full_branch_id,
    gvid: branchRow.gvid,
    parent_branch_id: branchRow.parent_branch_id,
    branch_code: branchRow.branch_code,
    branch_type: branchRow.branch_type,
    status: branchRow.status,
  }
}

export function useRequestBranchDetailsUpdateModal(
  isOpen: boolean,
  onClose: () => void,
  branchInfo: BranchInfoResponse['data'] | null | undefined,
) {
  const toast = useToast()
  const { countries: phoneCountries } = useCountriesData()
  const { useRequestBranchDetailsUpdateService } = useBranchMutations()
  const { mutateAsync: requestBranchDetailsUpdate } = useRequestBranchDetailsUpdateService()

  const [isRequesting, setIsRequesting] = useState(false)
  const [fieldsToUpdate, setFieldsToUpdate] =
    useState<Record<BranchDetailsFieldKey, boolean>>(INITIAL_FIELDS)
  const [proposed, setProposed] =
    useState<Record<BranchDetailsFieldKey, string>>(INITIAL_PROPOSED)
  const [reason, setReason] = useState('')

  const branch = branchRowToBranch(branchInfo?.branch)

  const resetRequestForm = useCallback(() => {
    setFieldsToUpdate({ ...INITIAL_FIELDS })
    setProposed({ ...INITIAL_PROPOSED })
    setReason('')
  }, [])

  useEffect(() => {
    if (isOpen) resetRequestForm()
  }, [isOpen, resetRequestForm])

  const toggleField = useCallback(
    (key: BranchDetailsFieldKey, checked: boolean) => {
      setFieldsToUpdate((prev) => ({ ...prev, [key]: checked }))
      if (checked && branch) {
        const currentByKey: Record<BranchDetailsFieldKey, string> = {
          branch_name: branch.branch_name ?? '',
          branch_location: branch.branch_location ?? '',
          branch_phone: branch.branch_phone ?? '',
          branch_email: branch.branch_email ?? '',
        }
        setProposed((prev) => ({ ...prev, [key]: currentByKey[key] }))
      } else {
        setProposed((prev) => ({ ...prev, [key]: '' }))
      }
    },
    [branch],
  )

  const setProposedValue = useCallback((key: BranchDetailsFieldKey, value: string) => {
    setProposed((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleClose = useCallback(() => {
    resetRequestForm()
    onClose()
  }, [onClose, resetRequestForm])

  const handleSetIsOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        resetRequestForm()
        onClose()
      }
    },
    [onClose, resetRequestForm],
  )

  const handleRequestUpdate = useCallback(async () => {
    if (!branch) return

    const selected = (
      Object.entries(fieldsToUpdate) as [BranchDetailsFieldKey, boolean][]
    ).filter(([, value]) => value)

    if (selected.length === 0) {
      toast.error('Select at least one field you want to update.')
      return
    }

    for (const [key] of selected) {
      if (!proposed[key]?.trim()) {
        toast.error(
          `Please provide a value for ${BRANCH_DETAILS_UPDATABLE_FIELDS.find((f) => f.key === key)?.label}.`,
        )
        return
      }
    }

    const editedBranch: Branch = {
      ...branch,
      branch_name: fieldsToUpdate.branch_name ? proposed.branch_name.trim() : branch.branch_name,
      branch_location: fieldsToUpdate.branch_location
        ? proposed.branch_location.trim()
        : branch.branch_location,
      branch_phone: fieldsToUpdate.branch_phone ? proposed.branch_phone.trim() : branch.branch_phone,
      branch_email: fieldsToUpdate.branch_email ? proposed.branch_email.trim() : branch.branch_email,
    }

    const validation = UpdateBranchDetailsFormSchema.safeParse({
      branch_name: editedBranch.branch_name,
      branch_location: editedBranch.branch_location,
      branch_phone: editedBranch.branch_phone ?? '',
      branch_email: editedBranch.branch_email ?? '',
    })

    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? 'Invalid branch details')
      return
    }

    const proposedData = buildBranchDetailsPatch(branch, editedBranch)
    if (Object.keys(proposedData).length === 0) {
      toast.error('Proposed values match your current branch details.')
      return
    }

    if (reason.length > 1000) {
      toast.error('Reason for change must be 1000 characters or fewer.')
      return
    }

    setIsRequesting(true)
    try {
      await requestBranchDetailsUpdate({
        proposed_data: proposedData,
        reason_for_change: reason.trim() || undefined,
      })
      handleClose()
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to submit request. Please try again.'
      toast.error(message)
    } finally {
      setIsRequesting(false)
    }
  }, [
    branch,
    fieldsToUpdate,
    proposed,
    reason,
    toast,
    handleClose,
    requestBranchDetailsUpdate,
  ])

  return {
    branch,
    isRequesting,
    fieldsToUpdate,
    proposed,
    reason,
    setReason,
    toggleField,
    setProposedValue,
    handleClose,
    handleSetIsOpen,
    handleRequestUpdate,
    phoneCountries,
  }
}
