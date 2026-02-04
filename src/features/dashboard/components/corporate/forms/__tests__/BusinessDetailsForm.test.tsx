import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import BusinessDetailsForm from '../BusinessDetailsForm'

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

const mockRegister = vi.fn(() => ({}))
const mockHandleSubmit = vi.fn((fn) => (e: React.FormEvent) => {
  e.preventDefault()
  fn({})
})

vi.mock('../hooks/useBusinessDetailsForm', () => ({
  useBusinessDetailsForm: () => ({
    form: {
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      control: {},
      formState: { errors: {} },
    },
    documentUrls: {},
    userProfileData: null,
    phoneCountries: [],
    isPending: false,
    isSavingProgress: false,
    onSubmit: vi.fn(),
    handleSaveProgress: vi.fn(),
    handleDiscard: vi.fn(),
  }),
}))

vi.mock('@/assets/gifs/loader.gif', () => ({ default: '/loader.gif' }))

describe('BusinessDetailsForm (corporate)', () => {
  it('renders Business Details heading', () => {
    renderWithProviders(<BusinessDetailsForm />)
    expect(screen.getByText('Business Details')).toBeInTheDocument()
    expect(screen.getByText(/complete your business information/i)).toBeInTheDocument()
  })

  it('renders Business Logo label', () => {
    renderWithProviders(<BusinessDetailsForm />)
    expect(screen.getByText(/business logo/i)).toBeInTheDocument()
  })
})
