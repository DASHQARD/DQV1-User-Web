import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-linear-to-br from-[#f8f9ff] to-white py-16 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-primary-500/10">
          <Icon icon="bi:compass" className="size-10 text-primary-500" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-500 mb-2">404</p>
        <h1 className="text-3xl md:text-4xl font-bold text-primary-500 mb-3">Page not found</h1>
        <p className="text-grey-500 mb-8 leading-relaxed">
          The page you are looking for does not exist or may have been moved. Check the URL or use
          the links below to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={ROUTES.IN_APP.HOME}>
            <Button variant="secondary" className="w-full sm:w-auto" icon="bi:house-fill">
              Go to homepage
            </Button>
          </Link>
          <Link to={ROUTES.IN_APP.CONTACT}>
            <Button variant="outline" className="w-full sm:w-auto">
              Contact support
            </Button>
          </Link>
        </div>
        <nav className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link to={ROUTES.IN_APP.DASHQARDS} className="text-primary-500 hover:underline">
            Gift cards
          </Link>
          <Link to={ROUTES.IN_APP.FAQ} className="text-primary-500 hover:underline">
            FAQ
          </Link>
          <Link to={ROUTES.IN_APP.AUTH.LOGIN} className="text-primary-500 hover:underline">
            Login
          </Link>
        </nav>
      </div>
    </div>
  )
}
