import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { DocumentViewer } from '../DocumentViewer/DocumentViewer'

describe('DocumentViewer', () => {
  const mockSetIsOpen = vi.fn()

  beforeEach(() => {
    mockSetIsOpen.mockClear()
    vi.stubGlobal('open', vi.fn())
  })

  it('renders document not available when documentUrl is null', () => {
    renderWithProviders(<DocumentViewer isOpen setIsOpen={mockSetIsOpen} documentUrl={null} />)
    expect(screen.getByText('Document not available')).toBeInTheDocument()
    expect(screen.getByText('The document could not be loaded.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('calls setIsOpen(false) when Close is clicked and documentUrl is null', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentViewer isOpen setIsOpen={mockSetIsOpen} documentUrl={null} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(mockSetIsOpen).toHaveBeenCalledWith(false)
  })

  it('renders iframe and action buttons when documentUrl is provided', () => {
    const url = 'https://example.com/doc.pdf'
    renderWithProviders(
      <DocumentViewer isOpen setIsOpen={mockSetIsOpen} documentUrl={url} documentName="My Doc" />,
    )
    const iframe = screen.getByTitle('My Doc')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', url)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open in new tab/i })).toBeInTheDocument()
  })

  it('calls setIsOpen(false) when Close is clicked with documentUrl', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DocumentViewer isOpen setIsOpen={mockSetIsOpen} documentUrl="https://example.com/doc.pdf" />,
    )
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(mockSetIsOpen).toHaveBeenCalledWith(false)
  })

  it('opens document in new tab when Open in New Tab is clicked', async () => {
    const user = userEvent.setup()
    const url = 'https://example.com/doc.pdf'
    renderWithProviders(<DocumentViewer isOpen setIsOpen={mockSetIsOpen} documentUrl={url} />)
    await user.click(screen.getByRole('button', { name: /open in new tab/i }))
    expect(window.open).toHaveBeenCalledWith(url, '_blank')
  })

  it('uses default document name when documentName is not provided', () => {
    renderWithProviders(
      <DocumentViewer isOpen setIsOpen={mockSetIsOpen} documentUrl="https://example.com/doc.pdf" />,
    )
    expect(screen.getByTitle('Document')).toBeInTheDocument()
  })
})
