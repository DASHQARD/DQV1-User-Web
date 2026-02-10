import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { RequestBusinessUpdateModal } from '../RequestBusinessUpdateModal'

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => true,
  }),
}))

const { UPDATABLE_FIELDS } = vi.hoisted(() => ({
  UPDATABLE_FIELDS: [
    { key: 'name', label: 'Business name' },
    { key: 'type', label: 'Business type' },
  ],
}))
vi.mock('../../hooks/useRequestBusinessUpdateModal', () => ({
  UPDATABLE_FIELDS,
  useRequestBusinessUpdateModal: () => ({
    business: { id: 1, business_name: 'Test Business' },
    isRequesting: false,
    fieldsToUpdate: {},
    proposed: {},
    reason: '',
    setReason: vi.fn(),
    toggleField: vi.fn(),
    setProposedValue: vi.fn(),
    handleClose: vi.fn(),
    handleSetIsOpen: vi.fn(),
    handleRequestUpdate: vi.fn(),
    phoneCountries: [],
  }),
}))

describe('RequestBusinessUpdateModal (corporate)', () => {
  it('when open with business, shows title and update section', () => {
    renderWithProviders(<RequestBusinessUpdateModal />)
    expect(screen.getAllByText('Request business information update').length).toBeGreaterThan(0)
    expect(
      screen.getByText(/Select the fields you want to change and provide the new values/i),
    ).toBeInTheDocument()
    expect(screen.getByText('What would you like to update?')).toBeInTheDocument()
  })
})
