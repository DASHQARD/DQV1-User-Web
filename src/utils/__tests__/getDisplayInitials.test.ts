import { describe, it, expect } from 'vitest'
import { getDisplayInitials } from '../getDisplayInitials'

describe('getDisplayInitials', () => {
  it('returns first and last initials for a full name', () => {
    expect(getDisplayInitials('Jane Doe')).toBe('JD')
  })

  it('uses first and last word for multi-part names', () => {
    expect(getDisplayInitials('Mary Jane Watson')).toBe('MW')
  })

  it('returns a single initial for one name', () => {
    expect(getDisplayInitials('Jane')).toBe('J')
  })

  it('returns empty string for missing names', () => {
    expect(getDisplayInitials('')).toBe('')
    expect(getDisplayInitials(null)).toBe('')
    expect(getDisplayInitials(undefined)).toBe('')
  })
})
