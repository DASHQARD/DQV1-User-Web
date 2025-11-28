// import { useCartStore } from '@/stores/cart'
// import { useCart } from '@/features/website/hooks/useCart'
// import { Icon } from '@/libs'
// import type { CartItemResponse } from '@/types/cart'

export default function CartPopoverContent() {
  // const { closeCart } = useCartStore()
  // const { cartItems, isLoading, deleteCartItem, isDeleting } = useCart()

  // const formatPrice = (price: number) => {
  //   return new Intl.NumberFormat('en-GH', {
  //     style: 'currency',
  //     currency: 'GHS',
  //     minimumFractionDigits: 2,
  //   }).format(price)
  // }

  // const handleRemoveItem = (id: number) => {
  //   deleteCartItem(id)
  // }

  // const subtotal = cartItems.reduce((total, item) => {
  //   return total + item.amount * item.quantity
  // }, 0)

  // const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    // <div className="flex flex-col w-[360px] max-h-[70vh]">
    //   <div className="p-6 border-b border-gray-200 flex-shrink-0">
    //     <h2 className="text-2xl font-bold text-gray-900">Shopping Bag</h2>
    //     <p className="text-sm text-gray-600 mt-1">
    //       {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
    //     </p>
    //   </div>

    //   <div className="flex-1 overflow-y-auto p-6 min-h-0">
    //     {isLoading ? (
    //       <div className="flex flex-col items-center justify-center h-full text-center">
    //         <Icon icon="mdi:loading" className="text-4xl text-primary-500 mb-4 animate-spin" />
    //         <p className="text-gray-600 text-sm">Loading cart...</p>
    //       </div>
    //     ) : cartItems.length === 0 ? (
    //       <div className="flex flex-col items-center justify-center h-full text-center">
    //         <Icon icon="bi:cart-x" className="text-6xl text-gray-300 mb-4" />
    //         <p className="text-gray-600 text-lg font-medium">Your bag is empty</p>
    //         <p className="text-gray-500 text-sm mt-2">Add items to get started</p>
    //       </div>
    //     ) : (
    //       <div className="space-y-4">
    //         {cartItems.map((item: CartItemResponse) => (
    //           <div
    //             key={item.id}
    //             className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
    //           >
    //             <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
    //               {item.card?.imageUrl ? (
    //                 <img
    //                   src={item.card.imageUrl}
    //                   alt={item.card.title || 'Cart item'}
    //                   className="w-full h-full object-cover"
    //                 />
    //               ) : (
    //                 <div className="w-full h-full flex items-center justify-center">
    //                   <Icon icon="bi:image" className="text-2xl text-gray-400" />
    //                 </div>
    //               )}
    //             </div>

    //             <div className="flex-1 min-w-0">
    //               <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
    //                 {item.card?.title || `Card #${item.card_id}`}
    //               </h3>
    //               {item.card?.subtitle && (
    //                 <p className="text-xs text-gray-600 mb-2">{item.card.subtitle}</p>
    //               )}
    //               <p className="text-sm font-semibold text-primary-500 mb-2">
    //                 {formatPrice(item.amount)}
    //               </p>

    //               <div className="flex items-center gap-3">
    //                 <div className="flex items-center border border-gray-300 rounded-lg">
    //                   <span className="px-4 py-1.5 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
    //                     Qty: {item.quantity}
    //                   </span>
    //                 </div>
    //                 <button
    //                   type="button"
    //                   onClick={() => handleRemoveItem(item.id)}
    //                   disabled={isDeleting}
    //                   className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
    //                   aria-label="Remove item"
    //                 >
    //                   <Icon icon="bi:trash" className="text-lg" />
    //                 </button>
    //               </div>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     )}
    //   </div>

    //   {cartItems.length > 0 && (
    //     <div className="border-t border-gray-200 p-6 space-y-4 flex-shrink-0">
    //       <div className="flex justify-between items-center">
    //         <span className="text-lg font-semibold text-gray-900">Subtotal:</span>
    //         <span className="text-xl font-bold text-primary-500">{formatPrice(subtotal)}</span>
    //       </div>
    //       <div className="space-y-2">
    //         <button
    //           type="button"
    //           onClick={closeCart}
    //           className="w-full rounded-full border-2 border-primary-500 bg-white px-6 py-3 text-sm font-bold text-primary-500 transition-all duration-200 hover:bg-primary-50"
    //         >
    //           View Bag ({totalItems})
    //         </button>
    //         <button
    //           type="button"
    //           className="w-full rounded-full bg-primary-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-primary-700 hover:-translate-y-0.5"
    //         >
    //           Proceed to Checkout
    //         </button>
    //       </div>
    //       {subtotal > 0 && (
    //         <p className="text-sm text-green-600 flex items-center gap-1">
    //           <Icon icon="bi:check-circle" />
    //           You earned Free Standard Shipping!
    //         </p>
    //       )}
    //     </div>
    //   )}
    // </div>
    <>
      <h1>Cart Modal</h1>
    </>
  )
}
