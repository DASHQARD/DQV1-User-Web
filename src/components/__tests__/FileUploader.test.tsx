import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import FileUploader from '../FileUploader/FileUploader'

describe('FileUploader', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('renders label when provided', () => {
    renderWithProviders(<FileUploader onChange={() => {}} label="Upload file" />)
    expect(screen.getByText('Upload file')).toBeInTheDocument()
  })

  it('renders drop/browse prompt when no value', () => {
    renderWithProviders(<FileUploader onChange={() => {}} />)
    expect(screen.getByText('Drop file or browse')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Browse Files' })).toBeInTheDocument()
  })

  it('shows format hint and max size', () => {
    renderWithProviders(
      <FileUploader onChange={() => {}} formatHint=".pdf only" maxFileSizeMb={10} />,
    )
    expect(screen.getByText(/Format: \.pdf only & Max file size: 10 MB/)).toBeInTheDocument()
  })

  it('renders error when error prop is provided', () => {
    renderWithProviders(<FileUploader onChange={() => {}} error="File is required" />)
    expect(screen.getByText('File is required')).toBeInTheDocument()
  })

  it('calls onChange when file is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<FileUploader onChange={onChange} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'test.png', { type: 'image/png' })
    await user.upload(input, file)
    expect(onChange).toHaveBeenCalledWith(file)
  })

  it('displays document file name and remove button when value is a document', () => {
    const pdf = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    const onChange = vi.fn()
    renderWithProviders(<FileUploader value={pdf} onChange={onChange} />)
    expect(screen.getByText('doc.pdf')).toBeInTheDocument()
    const removeBtn = screen.getByRole('button', { name: 'Delete file' })
    expect(removeBtn).toBeInTheDocument()
  })

  it('calls onChange(null) when remove is clicked', async () => {
    const user = userEvent.setup()
    const pdf = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    const onChange = vi.fn()
    renderWithProviders(<FileUploader value={pdf} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Delete file' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
