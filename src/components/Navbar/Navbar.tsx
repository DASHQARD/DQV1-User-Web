import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../assets/images/logo-placeholder.png'
import { ROUTES } from '../../utils/constants'
import { Icon } from '@/libs'
import { useCartStore } from '@/stores/cart'
// import { useCart } from '@/features/website/hooks/useCart'
import { useAuthStore } from '@/stores'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/PopOver'
import { CartPopoverContent } from '@/components/CartModal'

export default function Navbar() {
  const navigate = useNavigate()
  const { isOpen: isCartOpen, openCart, closeCart } = useCartStore()
  // const { cartItems } = useCart()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false)
  // const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const displayName =
    user?.fullname || user?.name || user?.email?.split('@')[0] || user?.username || 'there'

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
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-2 text-primary-500 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </ul>
          <button
            onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
            className="bg-black-50 py-[18px] px-[18px] flex items-center justify-center rounded-full"
          >
            <Icon icon="hugeicons:search-02" className="size-5 text-primary-500" />
          </button>
          <Popover open={isCartOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="bg-black-50 py-[18px] px-[18px] flex items-center justify-center rounded-full relative"
              >
                <Icon icon="bi:bag" className="size-5 text-primary-500" />
                {/* {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )} */}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={12}
              className="w-[393px] p-0 shadow-2xl border-none  bg-white"
            >
              <CartPopoverContent />
            </PopoverContent>
          </Popover>
          {isAuthenticated && (
            <Popover open={accountPopoverOpen} onOpenChange={setAccountPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="bg-black-50 py-[18px] px-[18px] flex items-center justify-center rounded-full"
                >
                  <Icon icon="bi:person-circle" className="size-5 text-primary-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={12}
                className="w-64 p-0 border border-gray-200 rounded-2xl shadow-xl bg-white"
              >
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">
                    Hi, <span className="font-semibold text-gray-900">{displayName}</span>
                  </p>
                </div>
                <div className="flex flex-col p-1 gap-1 text-sm text-gray-800">
                  {[
                    { label: 'My orders', icon: 'bi:box', path: ROUTES.IN_APP.DASHBOARD.ORDERS },
                    {
                      label: 'My Info',
                      icon: 'bi:pencil-square',
                      path: ROUTES.IN_APP.DASHBOARD.COMPLIANCE.PROFILE_INFORMATION,
                    },
                    { label: 'Notifications', icon: 'bi:bell', path: '/dashboard/notifications' },
                    {
                      label: 'Gift Cards',
                      icon: 'bi:gift',
                      path: ROUTES.IN_APP.DASHBOARD.REDEEM,
                    },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => {
                        navigate(item.path)
                        setAccountPopoverOpen(false)
                      }}
                      className="flex items-center gap-3 p-3 text-left hover:bg-black/20 transition-colors"
                    >
                      <Icon icon={item.icon} className="text-lg" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-4">
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setAccountPopoverOpen(false)
                      navigate(ROUTES.IN_APP.HOME)
                    }}
                    className="flex items-center gap-3 text-red-600 font-semibold hover:text-red-700"
                  >
                    <Icon icon="bi:box-arrow-right" className="text-lg" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {!isAuthenticated && (
            <ul className="flex justify-between items-center gap-5 bg-black-50 py-[18px] px-6 rounded-full text-sm">
              <Link to={ROUTES.IN_APP.AUTH.LOGIN} className="text-primary-500 font-medium">
                Login
              </Link>
              <Link to={ROUTES.IN_APP.AUTH.REGISTER} className="text-primary-500 font-medium">
                Register
              </Link>
            </ul>
          )}
        </section>
      </div>
    </nav>
  )
}
