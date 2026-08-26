import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { formatCurrency } from '../../utils/formatCurrency'
import { Icon } from '../../components/ui/Icon'

const NEXT_STATUS = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
}

export function OwnerOrdersPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadOrders(restaurantId) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at, order_items(item_name, quantity)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setOrders(data)
  }

  useEffect(() => {
    let isMounted = true

    async function init() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('owner_id', user.id)
        .maybeSingle()
      if (!isMounted) return
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setRestaurant(data)
      if (data) await loadOrders(data.id)
      setLoading(false)
    }

    init()
    return () => {
      isMounted = false
    }
  }, [user.id])

  async function advanceStatus(order) {
    const nextStatus = NEXT_STATUS[order.status]
    if (!nextStatus) return
    setError(null)
    const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', order.id)
    if (error) setError(error.message)
    else await loadOrders(restaurant.id)
  }

  if (loading) return <p className="page-status">Loading...</p>
  if (!restaurant) return <p className="page-status">No restaurant assigned to your account yet.</p>

  return (
    <div className="operations-page">
      <span className="section-kicker">Kitchen queue</span>
      <h2>Orders — {restaurant.name}</h2>
      {error && <p className="form-error">{error}</p>}

      {orders.length === 0 ? (
        <div className="empty-state"><span>🧾</span><h3>No orders yet</h3><p>New customer orders will appear here.</p></div>
      ) : (
        <ul className="order-list order-queue">
          {orders.map((order) => (
            <li key={order.id} className="card">
              <div className="queue-order-id"><small>Order</small><strong>#{order.id.slice(0, 6)}</strong><span><Icon name="clock" size={14} />{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
              <div className="queue-items">
                <ul>
                  {order.order_items.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.quantity}×</strong> {item.item_name}
                    </li>
                  ))}
                </ul>
                <p className="price">{formatCurrency(order.total_amount)}</p>
              </div>
              <div className="queue-actions">
                <OrderStatusBadge status={order.status} />
                {NEXT_STATUS[order.status] && (
                  <button onClick={() => advanceStatus(order)}>Mark as {NEXT_STATUS[order.status]} <Icon name="arrow" size={16} /></button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
