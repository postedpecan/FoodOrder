import { createContext, useContext, useEffect, useState } from 'react'
import { normalizeMenuPrice } from '../utils/studentPricing'

const CartContext = createContext(null)
const STORAGE_KEY = 'foodorder_cart'

function normalizeStoredCart(storedCart) {
  return Object.fromEntries(
    Object.entries(storedCart).map(([restaurantId, restaurantCart]) => [
      restaurantId,
      {
        ...restaurantCart,
        items: Object.fromEntries(
          Object.entries(restaurantCart.items ?? {}).map(([itemId, item]) => [
            itemId,
            { ...item, price: normalizeMenuPrice(item.price) },
          ])
        ),
      },
    ])
  )
}

// Cart is grouped per restaurant: { [restaurantId]: { restaurantName, items: { [menuItemId]: {..., quantity} } } }
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? normalizeStoredCart(JSON.parse(raw)) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  function addItem(restaurantId, restaurantName, menuItem) {
    setCart((prev) => {
      const restaurantCart = prev[restaurantId] ?? { restaurantName, items: {} }
      const existing = restaurantCart.items[menuItem.id]
      return {
        ...prev,
        [restaurantId]: {
          restaurantName,
          items: {
            ...restaurantCart.items,
            [menuItem.id]: {
              id: menuItem.id,
              name: menuItem.name,
              price: normalizeMenuPrice(menuItem.price),
              quantity: (existing?.quantity ?? 0) + 1,
            },
          },
        },
      }
    })
  }

  function updateQuantity(restaurantId, menuItemId, quantity) {
    setCart((prev) => {
      const restaurantCart = prev[restaurantId]
      if (!restaurantCart) return prev

      if (quantity <= 0) {
        const { [menuItemId]: _removed, ...remainingItems } = restaurantCart.items
        if (Object.keys(remainingItems).length === 0) {
          const { [restaurantId]: _removedRestaurant, ...remainingCart } = prev
          return remainingCart
        }
        return { ...prev, [restaurantId]: { ...restaurantCart, items: remainingItems } }
      }

      return {
        ...prev,
        [restaurantId]: {
          ...restaurantCart,
          items: {
            ...restaurantCart.items,
            [menuItemId]: { ...restaurantCart.items[menuItemId], quantity },
          },
        },
      }
    })
  }

  function clearRestaurant(restaurantId) {
    setCart((prev) => {
      const { [restaurantId]: _removed, ...rest } = prev
      return rest
    })
  }

  function clearCart() {
    setCart({})
  }

  const restaurantCount = Object.keys(cart).length
  const itemCount = Object.values(cart).reduce(
    (sum, r) => sum + Object.values(r.items).reduce((s, i) => s + i.quantity, 0),
    0
  )

  const value = { cart, addItem, updateQuantity, clearRestaurant, clearCart, restaurantCount, itemCount }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
