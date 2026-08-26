import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { formatCurrency } from '../../utils/formatCurrency'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'

export function OrderHistoryPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at, restaurants(name)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (!isMounted) return
      if (error) setError(error.message)
      else setOrders(data)
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('my-orders-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `customer_id=eq.${user.id}` },
        () => load()
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [user.id])

  if (loading) return <p className="page-status">Loading orders...</p>
  if (error) return <p className="page-status form-error">{error}</p>
  if (orders.length === 0) return <div className="empty-state empty-state-page"><span>🧾</span><h2>No orders yet</h2><p>Your next meal will appear here.</p><Link to="/" className="button-link">Find food <Icon name="arrow" size={17} /></Link></div>

  return (
    <div className="orders-page">
      <div className="page-title-row"><div><span className="section-kicker">Live updates</span><h1>My orders</h1><p>Follow every order from the kitchen to pickup.</p></div><Link to="/" className="secondary-button">Order something new</Link></div>
      <ul className="order-list customer-order-list">
        {orders.map((order) => (
          <li key={order.id} className="card">
            <span className="order-icon"><Icon name="bag" size={22} /></span>
            <div className="order-main">
              <small>Order #{order.id.slice(0, 8)}</small>
              <strong>{order.restaurants?.name}</strong>
              <p><Icon name="clock" size={15} />{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <strong className="order-price">{formatCurrency(order.total_amount)}</strong>
            <div className="order-status-stack"><OrderStatusBadge status={order.status} /><small>Status updates automatically</small></div>
          </li>
        ))}
      </ul>
    </div>
  )
}
