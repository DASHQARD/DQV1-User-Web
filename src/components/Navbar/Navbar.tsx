import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../assets/images/logo-placeholder.png'
import { ROUTES } from '../../utils/constants'
import { Icon } from '@/libs'

export default function Navbar() {
  const navigate = useNavigate()
  const navItems = [
    {
      label: 'About',
      path: ROUTES.IN_APP.ABOUT,
    },
    {
      label: 'Gift Cards',
      path: ROUTES.IN_APP.ABOUT,
    },
    {
      label: 'Vendors',
      path: ROUTES.IN_APP.VENDORS,
    },
    {
      label: 'Contact',
      path: ROUTES.IN_APP.CONTACT,
    },
    {
      label: 'Bulk Gifting',
      path: ROUTES.IN_APP.BULK_GIFTING,
    },
  ]
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="wrapper flex justify-between items-center py-[10px] ">
        <Link to={ROUTES.IN_APP.HOME}>
          <img src={Logo} alt="Logo" />
        </Link>
        <section className="flex justify-between items-center gap-4">
          <ul className="flex justify-between items-center gap-5 bg-black-50 py-[18px] px-6 rounded-full text-sm">
            {navItems.map((item) => (
              <Link to={item.path} className="flex items-center gap-2 text-primary-500 font-medium">
                {item.label}
              </Link>
            ))}
          </ul>
          <button
            onClick={() => navigate(ROUTES.IN_APP.PRODUCTS)}
            className="bg-black-50 py-[18px] px-[18px] flex items-center justify-center rounded-full"
          >
            <Icon icon="hugeicons:search-02" className="size-5 text-primary-500" />
          </button>
          <ul className="flex justify-between items-center gap-5 bg-black-50 py-[18px] px-6 rounded-full text-sm">
            <Link to={ROUTES.IN_APP.AUTH.LOGIN} className="text-primary-500 font-medium">
              Login
            </Link>
            <Link to={ROUTES.IN_APP.AUTH.REGISTER} className="text-primary-500 font-medium">
              Register
            </Link>
          </ul>
        </section>
      </div>
    </nav>
  )
}
