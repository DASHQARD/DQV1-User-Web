import { Tag, Text } from '@/components'
import { getStatusVariant } from '@/utils/helpers'
import { formatApproverLevelLabel } from '@/utils/requestEntity'
import type { ApprovalChainItem } from '@/types/requests'
import { isAdminApproverLevel } from '@/utils/requestEntity'

type RequestApprovalChainProps = {
  chain: ApprovalChainItem[]
}

function chainItemStatusLabel(item: ApprovalChainItem): string {
  const status = String(item.status ?? '').toLowerCase()
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

export function RequestApprovalChain({ chain }: RequestApprovalChainProps) {
  if (!chain.length) return null

  return (
    <div className="col-span-2 pt-2">
      <Text variant="span" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">
        Approval chain
      </Text>
      <ol className="space-y-3">
        {chain.map((item, index) => {
          const levelLabel = formatApproverLevelLabel(String(item.level ?? ''))
          const isAdminStep = isAdminApproverLevel(String(item.level ?? ''))
          return (
            <li
              key={`${item.level}-${index}`}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Text variant="span" weight="semibold" className="text-sm text-gray-900 capitalize">
                    {levelLabel}
                  </Text>
                  <Tag variant={getStatusVariant(item.status)} value={chainItemStatusLabel(item)} />
                </div>
                {item.approver_name ? (
                  <Text variant="span" className="text-xs text-gray-600 block mt-1">
                    {item.approver_name}
                    {item.approver_user_type ? ` · ${item.approver_user_type}` : ''}
                  </Text>
                ) : null}
                {isAdminStep ? (
                  <Text variant="span" className="text-xs text-gray-500 block mt-1">
                    Platform admin approval is handled in the admin dashboard (separate app).
                  </Text>
                ) : null}
                {item.comments ? (
                  <Text variant="span" className="text-xs text-gray-600 block mt-1">
                    {item.comments}
                  </Text>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
