"use client";
import Link from "next/link";
import { useCart } from "react-use-cart";
import StoreSidebar from "../components/StoreSidebar";

export default function CartPage() {
  const { 
    items, 
    cartTotal, 
    totalItems, 
    totalUniqueItems,
    updateItemQuantity, 
    removeItem, 
    emptyCart,
    metadata 
  } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StoreSidebar />
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <div className="text-sm text-gray-500">
              {totalUniqueItems} item{totalUniqueItems !== 1 ? 's' : ''} • {totalItems} total
            </div>
          </div>
          
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Link 
                href="/store" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm border divide-y">
                {items.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center gap-4">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.site}</p>
                      <p className="text-sm text-green-600 capitalize">{item.availability?.replace('_', ' ')}</p>
                      {item.dealInfo?.discountPercent && (
                        <span className="text-sm text-red-600 font-medium">
                          -{item.dealInfo.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${item.itemTotal?.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      {item.listPrice && item.listPrice > item.price && (
                        <p className="text-sm text-gray-400 line-through">${item.listPrice.toFixed(2)}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total: ${cartTotal.toFixed(2)}</span>
                    <button 
                      onClick={emptyCart}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear Cart
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {totalItems} items • {totalUniqueItems} unique products
                  </div>
                  {metadata && (
                    <div className="text-xs text-gray-400 mt-1">
                      Cart saved automatically to your device
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <Link 
                    href="/store" 
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-center hover:bg-gray-300 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}