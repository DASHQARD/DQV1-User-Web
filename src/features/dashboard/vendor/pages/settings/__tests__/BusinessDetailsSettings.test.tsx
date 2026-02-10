import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { BusinessDetailsSettings } from '../BusinessDetailsSettings'

vi.mock('@/features/dashboard/vendor/hooks', async () => {
  const { useForm } = await vi.importActual<typeof import('react-hook-form')>('react-hook-form')
  return {
    useBusinessDetailsSettingsForm: () => {
      const form = useForm({
      defaultValues: {
        id: 0,
        name: '',
        type: '',
        phone: '',
        email: '',
        street_address: '',
        digital_address: '',
        registration_number: '',
      },
    })
    return {
      form,
      phoneCountries: [],
      businessTypeOptions: [{ label: 'Retail', value: 'retail' }],
      onSubmit: vi.fn(),
      isPending: false,
      isApproved: false,
    }
  },
  }
})

describe('BusinessDetailsSettings (vendor)', () => {
  it('renders Business Name and Business Type fields', () => {
    renderWithProviders(<BusinessDetailsSettings />)
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument()
    expect(screen.getAllByText(/business type/i).length).toBeGreaterThan(0)
  })

  it('renders Save Changes button', () => {
    renderWithProviders(<BusinessDetailsSettings />)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('renders form labels for email, address, and registration', () => {
    renderWithProviders(<BusinessDetailsSettings />)
    expect(screen.getByPlaceholderText(/provide your business name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter street address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter registration number/i)).toBeInTheDocument()
  })
})
