import { postMethod } from './requests'

export type FeedbackType = 'bug' | 'feature' | 'general' | 'ui'

export type FeedbackFormData = {
  rating: number
  type: FeedbackType | ''
  message: string
  email: string
}

export type FeedbackPayload = {
  rating?: number
  feedback_type: string
  improvement_text: string
  email?: string
}

export function createFeedbackPayload(data: FeedbackFormData): FeedbackPayload {
  const payload: FeedbackPayload = {
    improvement_text: data.message.trim(),
    feedback_type: data.type || 'general',
  }
  if (data.rating > 0) payload.rating = data.rating
  if (data.email?.trim()) payload.email = data.email.trim()
  return payload
}

const FEEDBACK_API_URL = '/feedback'

export async function submitFeedback(payload: FeedbackPayload) {
  const res = await postMethod(FEEDBACK_API_URL, payload)
  return res.data
}
