import { getApiErrorMessage } from '@/utils/apiError'

export type GuestCartSyncFailedLine = {
  lineId: string
  product: string
}

export class GuestCartSyncError extends Error {
  readonly failedLine?: GuestCartSyncFailedLine

  constructor(message: string, failedLine?: GuestCartSyncFailedLine) {
    super(message)
    this.name = 'GuestCartSyncError'
    this.failedLine = failedLine
  }
}

export function toGuestCartSyncError(
  error: unknown,
  failedLine?: GuestCartSyncFailedLine,
): GuestCartSyncError {
  if (error instanceof GuestCartSyncError) return error
  const message = getApiErrorMessage(error, 'Could not add your gift cards to checkout.')
  return new GuestCartSyncError(message, failedLine)
}
