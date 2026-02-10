import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { waitFor } from '@testing-library/react'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ToastProvider } from '../ToastProvider/ToastProvider'
import { useToast } from '@/hooks'

function ToastTrigger() {
  const { success, error, info } = useToast()
  return (
    <div>
      <button type="button" onClick={() => success('Success message')} data-testid="trigger-success">
        Success
      </button>
      <button
        type="button"
        onClick={() => success('With title', 'My Title')}
        data-testid="trigger-success-title"
      >
        Success with title
      </button>
      <button type="button" onClick={() => error('Error message')} data-testid="trigger-error">
        Error
      </button>
      <button type="button" onClick={() => info('Info message')} data-testid="trigger-info">
        Info
      </button>
    </div>
  )
}

function getToastList() {
  return document.body.querySelector('ul[class*="fixed"]')
}

function getToastItems() {
  const list = getToastList()
  return list ? Array.from(list.querySelectorAll('li')) : []
}

describe('ToastProvider', () => {
  it('renders children', () => {
    renderWithProviders(
      <ToastProvider>
        <div data-testid="child">Child</div>
      </ToastProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('renders toast list container in document body', () => {
    renderWithProviders(
      <ToastProvider>
        <span />
      </ToastProvider>,
    )
    const list = getToastList()
    expect(list).toBeTruthy()
  })

  describe('toast list map (message, title, type, close)', () => {
    it('renders success toast with message when success() is called', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )
      await user.click(screen.getByTestId('trigger-success'))
      const items = getToastItems()
      expect(items).toHaveLength(1)
      expect(items[0]).toHaveTextContent('Success message')
      expect(items[0].className).toMatch(/bg-success/)
    })

    it('renders toast with title when title is passed', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )
      await user.click(screen.getByTestId('trigger-success-title'))
      const items = getToastItems()
      expect(items).toHaveLength(1)
      expect(items[0]).toHaveTextContent('My Title')
      expect(items[0]).toHaveTextContent('With title')
    })

    it('renders error toast with error variant styles', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )
      await user.click(screen.getByTestId('trigger-error'))
      const items = getToastItems()
      expect(items).toHaveLength(1)
      expect(items[0]).toHaveTextContent('Error message')
      expect(items[0].className).toMatch(/bg-error-500/)
    })

    it('renders info toast with info variant styles', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )
      await user.click(screen.getByTestId('trigger-info'))
      const items = getToastItems()
      expect(items).toHaveLength(1)
      expect(items[0]).toHaveTextContent('Info message')
      expect(items[0].className).toMatch(/bg-neutral-grey-500/)
    })

    it('renders multiple toasts when multiple triggers are fired', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )
      await user.click(screen.getByTestId('trigger-success'))
      await user.click(screen.getByTestId('trigger-error'))
      const items = getToastItems()
      expect(items).toHaveLength(2)
      expect(items[0]).toHaveTextContent('Success message')
      expect(items[1]).toHaveTextContent('Error message')
    })

    it('close button removes that toast', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      )
      await user.click(screen.getByTestId('trigger-success'))
      expect(getToastItems()).toHaveLength(1)
      const closeBtn = document.body.querySelector('[data-testid="close-toast"]')
      expect(closeBtn).toBeInTheDocument()
      await user.click(closeBtn as HTMLButtonElement)
      await waitFor(() => {
        expect(getToastItems()).toHaveLength(0)
      })
    })
  })
})
