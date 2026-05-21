import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import FaqPage from '../faq/FaqPage'
import { FAQ_DATA } from '../../data/faqData'

describe('FaqPage', () => {
  it('renders FAQ heading and categories', () => {
    renderWithProviders(<FaqPage />)
    expect(screen.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeInTheDocument()
    expect(screen.getByText(FAQ_DATA[0].title)).toBeInTheDocument()
    expect(screen.getByText(/Still need help/i)).toBeInTheDocument()
  })

  it('expands a category and shows a question answer', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FaqPage />)

    const categoryButton = screen.getByRole('button', { name: new RegExp(FAQ_DATA[0].title, 'i') })
    await user.click(categoryButton)

    const firstQuestion = FAQ_DATA[0].items[0].q
    expect(screen.getByText(firstQuestion)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: new RegExp(firstQuestion, 'i') }))
    expect(screen.getByText(FAQ_DATA[0].items[0].a, { exact: false })).toBeInTheDocument()
  })

  it('links to contact page from support card', () => {
    renderWithProviders(<FaqPage />)
    expect(screen.getByRole('link', { name: /Contact us/i })).toHaveAttribute('href', '/contact')
  })
})
