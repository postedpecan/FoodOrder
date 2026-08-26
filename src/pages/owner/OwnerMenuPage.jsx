import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { Icon } from '../../components/ui/Icon'
import { normalizeMenuPrice } from '../../utils/studentPricing'

const EMPTY_FORM = { name: '', description: '', price: '35' }

export function OwnerMenuPage() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function loadItems(restaurantId) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, description, price, is_available')
      .eq('restaurant_id', restaurantId)
      .order('name')
    if (error) setError(error.message)
    else setItems(data.map((item) => ({ ...item, price: normalizeMenuPrice(item.price) })))
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
      if (data) await loadItems(data.id)
      setLoading(false)
    }

    init()
    return () => {
      isMounted = false
    }
  }, [user.id])

  async function handleAddItem(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const price = Number(form.price)
      if (!Number.isInteger(price) || price < 25 || price > 50) {
        throw new Error('Price must be a whole amount between ฿25 and ฿50.')
      }
      const { error } = await supabase.from('menu_items').insert({
        restaurant_id: restaurant.id,
        name: form.name,
        description: form.description || null,
        price,
      })
      if (error) throw error
      setForm(EMPTY_FORM)
      await loadItems(restaurant.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailable(item) {
    setError(null)
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id)
    if (error) setError(error.message)
    else await loadItems(restaurant.id)
  }

  async function deleteItem(item) {
    setError(null)
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id)
    if (error) setError(error.message)
    else await loadItems(restaurant.id)
  }

  if (loading) return <p className="page-status">Loading...</p>
  if (!restaurant) return <p className="page-status">No restaurant assigned to your account yet.</p>

  return (
    <div className="operations-page">
      <span className="section-kicker">Catalog management</span>
      <h2>Menu — {restaurant.name}</h2>
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleAddItem} className="card create-panel">
        <div className="create-panel-title"><span><Icon name="plus" /></span><div><strong>Add a menu item</strong><small>Create a new dish for your storefront</small></div></div>
        <div className="form-grid">
        <input
          placeholder="Item name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <label className="price-field">
          <span>Price (Thai baht)</span>
          <input
            placeholder="Average ฿35"
            type="number"
            step="1"
            min="25"
            max="50"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <small>Student range: ฿25–฿50</small>
        </label>
        <button type="submit" disabled={saving} className="save-button">
          {saving ? 'Adding...' : 'Add item'}
        </button>
        </div>
      </form>

      <div className="section-heading compact-heading"><div><span className="section-kicker">Your catalog</span><h2>Menu items</h2></div><span className="result-count">{items.length} items</span></div>
      {items.length === 0 ? <div className="empty-state"><span>🍽️</span><h3>Your menu is empty</h3><p>Add the first item using the form above.</p></div> : <ul className="order-list management-list">
        {items.map((item) => (
          <li key={item.id} className="card">
            <span className="item-thumbnail">🍴</span>
            <div className="management-main">
              <strong>{item.name}</strong>
              {item.description && <p>{item.description}</p>}
              <p className="price">{formatCurrency(item.price)}</p>
            </div>
            <div className="menu-item-actions">
              <span className={item.is_available ? 'availability-pill active' : 'availability-pill'}><i />{item.is_available ? 'Available' : 'Unavailable'}</span>
              <button className="secondary-button" onClick={() => toggleAvailable(item)}>
                {item.is_available ? 'Mark unavailable' : 'Mark available'}
              </button>
              <button className="danger-button" onClick={() => deleteItem(item)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>}
    </div>
  )
}
