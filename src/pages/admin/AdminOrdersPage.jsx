import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { formatCurrency } from '../../utils/formatCurrency'
import { Icon } from '../../components/ui/Icon'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    supabase
      .from('orders')
      .select('id, status, total_amount, created_at, restaurants(name), profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) setError(error.message)
        else setOrders(data)
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) return <p className="page-status">Loading...</p>
  if (error) return <p className="page-status form-error">{error}</p>

  return (
    <div className="operations-page">
      <div className="page-title-row"><div><span className="section-kicker">Platform activity</span><h1>All orders</h1><p>A complete view of customer orders across every restaurant.</p></div><span className="secure-note">{orders.length} total</span></div>
      {orders.length === 0 ? (
        <div className="empty-state"><span>🧾</span><h3>No orders yet</h3><p>Platform orders will appear here.</p></div>
      ) : (
        <ul className="order-list admin-order-list">
          {orders.map((order) => (
            <li key={order.id} className="card">
              <span className="order-icon"><Icon name="orders" size={21} /></span>
              <div className="order-main">
                <small>#{order.id.slice(0, 8)}</small>
                <strong>{order.restaurants?.name}</strong>
                <p>Customer: {order.profiles?.full_name || order.profiles?.email}</p>
                <p><Icon name="clock" size={15} />{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <strong className="order-price">{formatCurrency(order.total_amount)}</strong>
              <OrderStatusBadge status={order.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
