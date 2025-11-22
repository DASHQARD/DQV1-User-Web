import { ROUTES } from '@/utils/constants/shared'

import { Link } from 'react-router-dom'
import MelcomPlusLogo from '@/assets/images/DashGo.png'
import { Button, Input, Text } from '@/components'
import { Icon } from '@/libs'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'

// Simple QR Code placeholder component
const QRCodePlaceholder = ({ size = 120 }: { size?: number }) => {
  // Static pattern for QR code appearance
  // prettier-ignore
  const pattern = [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  return (
    <div
      className="bg-white p-2 rounded border border-gray-200"
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gridTemplateRows: 'repeat(8, 1fr)',
        gap: '2px',
      }}
    >
      {pattern.map((cell, i) => (
        <div
          key={i}
          className={cell === 1 ? 'bg-black' : 'bg-white'}
          style={{ aspectRatio: '1' }}
        />
      ))}
    </div>
  )
}

// Qard Card Component
const QardCard = ({
  brand,
  value,
  vendorName,
  rating,
  ratingCount,
}: {
  brand: string
  value: string
  vendorName: string
  rating: number
  ratingCount: number
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative rounded-lg p-4 flex flex-col justify-between"
        style={{
          background: 'linear-gradient(135deg, #ff6b9d 0%, #ffa500 100%)',
          minHeight: '200px',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:gift" className="size-5 text-white" />
            <span className="text-white font-bold text-sm">{brand}</span>
          </div>
          <span className="text-white font-bold">{value}</span>
        </div>
        <div className="flex justify-center my-4">
          <QRCodePlaceholder size={100} />
        </div>
        <div className="flex items-center">
          <span className="text-white font-semibold text-sm">{vendorName}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              icon="bi:star-fill"
              className={`size-4 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-sm text-grey-500 ml-1">{ratingCount}</span>
        </div>
        <Button variant="secondary" size="small" className="!rounded-sm">
          Get Qard
        </Button>
      </div>
    </div>
  )
}

export default function ProductDetails() {
  const amount = [
    {
      id: 1,
      amount: 10,
      price: 10,
    },
    {
      id: 3,
      amount: 30,
      price: 30,
    },
    {
      id: 5,
      amount: 50,
      price: 50,
    },
    {
      id: 10,
      amount: 100,
      price: 100,
    },
  ]

  // Mock data for vendor
  const vendor = {
    name: 'Melcom Ghana Ltd',
    id: 'VENDOR-12345',
    rating: 4.5,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut volutpat diam felis, lobortis facilisis lacus finibus convallis. Sed rutrum, enim ultrices ullamcorper elementum, nisi neque euismod massa, a aliquam quam sem id odio.',
    logo: MelcomPlusLogo,
  }

  // Mock data for Qards
  const qards = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    brand: 'DASHGO',
    value: '500.00',
    vendorName: 'MELCOM',
    rating: 4,
    ratingCount: 120,
  }))

  const totalQards = 30

  return (
    <div>
      {/* Original Product Details Section */}

      {/* Vendor Details Section */}
      <div className="bg-[#F3F3F3] min-h-screen">
        <section className="wrapper flex flex-col gap-8 py-12">
          <section>
            <div className="flex items-center gap-4">
              <div>
                <img src={MelcomPlusLogo} alt="Melcom Plus Logo" />
              </div>
              <div className="p-4">
                <section className="flex flex-col gap-[10px]">
                  <p className="w-fit flex gap-1 items-center font-medium text-white bg-grey-500/30 border border-white/20 py-2 px-5 rounded-[50px]">
                    <Icon icon="bi:lightning-fill" /> Fast Email Delivery (1-3 Min.)
                  </p>
                  <h1 className="text-[40px] font-bold leading-[48px]">
                    Buy a US Razer Gold Gift Card Online
                  </h1>
                  <div className="flex items-center gap-2">
                    {amount.map((item) => (
                      <button
                        key={item.id}
                        className="flex items-center gap-2 py-[10px] px-3 text-xs bg-primary-500 text-white rounded-[50px]"
                      >
                        <p>{item.amount}</p>
                      </button>
                    ))}
                  </div>

                  <p>Vendor: Melcom Plus</p>

                  <div>
                    <Text>Description</Text>
                    <p>
                      Melcom Plus Gift Qard is a gift card that can be used to purchase products
                      from Melcom Plus.
                    </p>
                  </div>
                  <Input label="Enter Amount" placeholder="Enter the amount" className="w-full" />
                </section>
              </div>
              <section className="border border-grey rounded-[10px] p-4 flex flex-col gap-4">
                <p>Quantity</p>
                <input type="number" placeholder="Enter the quantity" className="w-full" />
                <div className="flex items-center gap-2 flex-col">
                  <Button variant="outline" className="w-full">
                    Add to cart
                  </Button>
                  <PurchaseModal />
                </div>
              </section>
            </div>
          </section>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Link to={ROUTES.IN_APP.HOME} className="text-base underline">
              Home
            </Link>
            <div className="w-px h-[10px] bg-black-50" />
            <p className="text-base">Vendor</p>
            <div className="w-px h-[10px] bg-black-50" />
            <p className="text-base">{vendor.name}</p>
          </div>

          {/* About Vendor Section */}
          <section className="bg-white rounded-lg p-6 relative">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-6 flex-1">
                {/* Vendor Logo */}
                <div className="w-32 h-32 rounded-full bg-white border-2 border-grey-500/20 flex items-center justify-center shrink-0">
                  <Icon icon="mdi:gift" className="size-16 text-grey-500" />
                </div>

                {/* Vendor Info */}
                <div className="flex flex-col gap-3 flex-1">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{vendor.name}</h2>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon
                            key={i}
                            icon="bi:star-fill"
                            className={`size-5 ${i < Math.floor(vendor.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold">{vendor.rating}</span>
                    </div>
                    <p className="text-sm text-grey-500">[Vendor ID here]</p>
                  </div>
                  <p className="text-base leading-relaxed text-grey-500">{vendor.description}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="shrink-0">
                <QRCodePlaceholder size={120} />
              </div>
            </div>
          </section>

          {/* Qards from vendor Section */}
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Qards from vendor ({totalQards} Qards)</h2>

            {/* Qard Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {qards.map((qard) => (
                <QardCard
                  key={qard.id}
                  brand={qard.brand}
                  value={qard.value}
                  vendorName={qard.vendorName}
                  rating={qard.rating}
                  ratingCount={qard.ratingCount}
                />
              ))}
            </div>

            {/* Footer Links */}
            <div className="flex items-center justify-between pt-4">
              <Link to="#" className="text-base text-primary-500 hover:underline">
                Load More
              </Link>
              <Link to="#" className="text-base text-primary-500 hover:underline">
                View terms and conditions
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
