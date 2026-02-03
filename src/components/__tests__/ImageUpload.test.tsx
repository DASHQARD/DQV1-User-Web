import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import ImageUpload from '../ImageUpload/ImageUpload'

beforeEach(() => {
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn(),
  })
})

describe('ImageUpload', () => {
  it('renders file input and camera button when no file', () => {
    renderWithProviders(<ImageUpload file={null} onFileChange={() => {}} onUpload={() => {}} />)
    const input = document.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png,image/webp')
  })

  it('calls onFileChange and onUpload when file is selected', async () => {
    const user = userEvent.setup()
    const onFileChange = vi.fn()
    const onUpload = vi.fn()
    renderWithProviders(<ImageUpload file={null} onFileChange={onFileChange} onUpload={onUpload} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    await user.upload(input, file)
    expect(onFileChange).toHaveBeenCalledWith(file)
    expect(onUpload).toHaveBeenCalledWith(file)
  })

  it('shows image when file is provided', () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    renderWithProviders(<ImageUpload file={file} onFileChange={() => {}} onUpload={() => {}} />)
    const img = document.querySelector('img[alt="profile"]')
    expect(img).toBeInTheDocument()
  })

  it('disables input when isUploading', () => {
    renderWithProviders(
      <ImageUpload file={null} onFileChange={() => {}} onUpload={() => {}} isUploading />,
    )
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeDisabled()
  })
})
