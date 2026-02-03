import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { Pagination } from '../Pagination/Pagination'

describe('Pagination', () => {
  it('renders Prev and Next buttons', () => {
    renderWithProviders(<Pagination limit={10} total={25} />)
    expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('disables Prev on first page', () => {
    renderWithProviders(<Pagination limit={10} total={25} currentPage={1} />)
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled()
  })

  it('disables Next on last page', () => {
    renderWithProviders(<Pagination limit={10} total={25} currentPage={3} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('calls onPageChange when a page number is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithProviders(
      <Pagination limit={10} total={30} currentPage={1} onPageChange={onPageChange} />,
    )
    const page3Button = screen.getByRole('button', { name: '3' })
    await user.click(page3Button)
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onNextPage when Next is clicked and onNextPage provided', async () => {
    const user = userEvent.setup()
    const onNextPage = vi.fn()
    renderWithProviders(<Pagination limit={10} total={25} hasNextPage onNextPage={onNextPage} />)
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onNextPage).toHaveBeenCalled()
  })
})
