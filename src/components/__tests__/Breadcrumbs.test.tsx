import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../Breadcrumb/Breadcrumbs'

describe('Breadcrumbs', () => {
  it('renders breadcrumb nav with aria-label', () => {
    const { getByRole } = renderWithProviders(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
    expect(getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(getByRole('link', { name: /current/i })).toBeInTheDocument()
  })
})
