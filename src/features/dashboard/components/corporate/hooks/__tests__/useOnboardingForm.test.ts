import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { useOnboardingForm } from '../useOnboardingForm'

const mockReset = vi.fn()
const mockGetValues = vi.fn()
const mockSetValue = vi.fn()
const mockClearErrors = vi.fn()
const mockWatch = vi.fn()
const mockHandleSubmit = vi.fn()

let profileData: Record<string, unknown> | undefined = {
  fullname: 'Jane Doe',
  dob: '',
  street_address: '',
  id_type: '',
  id_number: '',
}

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>()
  return {
    ...actual,
    useForm: vi.fn(() => ({
      reset: mockReset,
      getValues: mockGetValues,
      setValue: mockSetValue,
      clearErrors: mockClearErrors,
      watch: mockWatch,
      handleSubmit: mockHandleSubmit,
      formState: { isDirty: false, isValid: false, isSubmitting: false, errors: {} },
    })),
  }
})

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/stores', () => ({
  useAuthStore: () => ({ user: { user_type: 'corporate' } }),
}))

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({
      data: profileData,
      isLoading: false,
    }),
  }),
  useUploadFiles: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
  usePersistedModalState: () => ({ openModal: vi.fn() }),
}))

vi.mock('@/features/auth/hooks', () => ({
  useAuth: () => ({
    usePersonalDetailsWithIDService: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  }),
}))

describe('useOnboardingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    profileData = {
      fullname: 'Jane Doe',
      dob: '',
      street_address: '',
      id_type: '',
      id_number: '',
    }
    mockWatch.mockReturnValue('')
    mockGetValues.mockReturnValue(undefined)
    vi.mocked(useForm).mockReturnValue({
      reset: mockReset,
      getValues: mockGetValues,
      setValue: mockSetValue,
      clearErrors: mockClearErrors,
      watch: mockWatch,
      handleSubmit: mockHandleSubmit,
      formState: { isDirty: false, isValid: false, isSubmitting: false, errors: {} },
    } as never)
  })

  it('hydrates the form once from profile data', async () => {
    renderHook(() => useOnboardingForm())

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledTimes(1)
    })

    expect(mockReset).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Jane',
        last_name: 'Doe',
      }),
    )
  })

  it('does not reset the form when profile data refetches', async () => {
    const { rerender } = renderHook(() => useOnboardingForm())

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledTimes(1)
    })

    profileData = {
      ...profileData,
      fullname: 'Jane Doe',
    }

    rerender()

    expect(mockReset).toHaveBeenCalledTimes(1)
  })
})
