import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { normalizeMenuPrice } from '../../utils/studentPricing'

export function CheckoutPage() {
  const { user } = useAuth()
  const { cart, updateQuantity, clearRestaurant } = useCart()
  const navigate = useNavigate()
  const [placingId, setPlacingId] = useState(null)
  const [error, setError] = useState(null)

  const restaurantIds = Object.keys(cart)

  async function placeOrder(restaurantId) {
    setError(null)
    setPlacingId(restaurantId)
    try {
      const restaurantCart = cart[restaurantId]
      const items = Object.values(restaurantCart.items).map((item) => ({
        ...item,
        price: normalizeMenuPrice(item.price),
      }))
      const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ customer_id: user.id, restaurant_id: restaurantId, total_amount: totalAmount })
        .select()
        .single()
      if (orderError) throw orderError

      const orderItems = items.map((i) => ({
        order_id: order.id,
        menu_item_id: i.id,
        item_name: i.name,
        item_price: i.price,
        quantity: i.quantity,
      }))
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      clearRestaurant(restaurantId)
      navigate('/my-orders')
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacingId(null)
    }
  }

  if (restaurantIds.length === 0) {
    return (
      <div className="empty-state empty-state-page">
        <span>🛒</span>
        <h2>Your cart is hungry</h2>
        <p>Browse restaurants and add something delicious.</p>
        <Link to="/" className="button-link">Browse restaurants <Icon name="arrow" size={17} /></Link>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="page-title-row">
        <div><span className="section-kicker">Almost there</span><h1>Your cart</h1><p>Orders from different restaurants are placed separately.</p></div>
        <span className="secure-note">✓ Simple campus pickup</span>
      </div>
      {error && <p className="form-error">{error}</p>}

      {restaurantIds.map((restaurantId) => {
        const restaurantCart = cart[restaurantId]
        const items = Object.values(restaurantCart.items)
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

        return (
          <section key={restaurantId} className="checkout-group">
            <div className="card cart-group">
              <div className="cart-restaurant-title"><span className="mini-store"><Icon name="store" size={19} /></span><div><small>Your order from</small><h2>{restaurantCart.restaurantName}</h2></div></div>
              <ul className="cart-items">
                {items.map((item) => (
                  <li key={item.id}>
                    <span className="cart-item-art">🍽️</span>
                    <span className="cart-item-name"><strong>{item.name}</strong><small>{formatCurrency(item.price)} each</small></span>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(restaurantId, item.id, item.quantity - 1)} aria-label={`Decrease ${item.name}`}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(restaurantId, item.id, item.quantity + 1)} aria-label={`Increase ${item.name}`}>+</button>
                    </div>
                    <strong className="line-price">{formatCurrency(item.price * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="card order-summary">
              <span className="section-kicker">Order summary</span>
              <div className="summary-line"><span>Items</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
              <div className="summary-line"><span>Pickup</span><span>Free</span></div>
              <div className="summary-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
              <button className="primary-wide" onClick={() => placeOrder(restaurantId)} disabled={placingId === restaurantId}>
                {placingId === restaurantId ? 'Placing order...' : <>Place order <Icon name="arrow" size={18} /></>}
              </button>
              <small className="summary-help">You can track its progress from My Orders.</small>
            </aside>
          </section>
        )
      })}
    </div>
  )
}
