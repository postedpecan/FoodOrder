import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Icon } from '../../components/ui/Icon'

const EMPTY_FORM = { name: '', description: '' }

export function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function loadAll() {
    const [{ data: restaurantData, error: restaurantError }, { data: ownerData, error: ownerError }] =
      await Promise.all([
        supabase
          .from('restaurants')
          .select('id, name, description, is_active, owner_id, profiles(full_name, email)')
          .order('name'),
        supabase.from('profiles').select('id, full_name, email').eq('role', 'owner').order('email'),
      ])
    if (restaurantError) setError(restaurantError.message)
    else setRestaurants(restaurantData)
    if (ownerError) setError(ownerError.message)
    else setOwners(ownerData)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const { error } = await supabase.from('restaurants').insert({
        name: form.name,
        description: form.description || null,
      })
      if (error) throw error
      setForm(EMPTY_FORM)
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function assignOwner(restaurantId, ownerId) {
    setError(null)
    const { error } = await supabase
      .from('restaurants')
      .update({ owner_id: ownerId || null })
      .eq('id', restaurantId)
    if (error) setError(error.message)
    else await loadAll()
  }

  async function toggleActive(restaurant) {
    setError(null)
    const { error } = await supabase
      .from('restaurants')
      .update({ is_active: !restaurant.is_active })
      .eq('id', restaurant.id)
    if (error) setError(error.message)
    else await loadAll()
  }

  if (loading) return <p className="page-status">Loading...</p>

  return (
    <div className="operations-page">
      <div className="page-title-row"><div><span className="section-kicker">Platform administration</span><h1>Restaurants</h1><p>Create storefronts, assign owners and control visibility.</p></div><span className="secure-note">{restaurants.filter((item) => item.is_active).length} active</span></div>
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleCreate} className="card create-panel">
        <div className="create-panel-title"><span><Icon name="plus" /></span><div><strong>Create a restaurant</strong><small>Add a new storefront to FoodOrder</small></div></div>
        <div className="form-grid">
        <input
          placeholder="Restaurant name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit" disabled={saving} className="save-button">
          {saving ? 'Creating...' : 'Create restaurant'}
        </button>
        </div>
      </form>

      <p className="hint">
        To assign an owner, first promote a user to the "owner" role on the Users page, then pick them below.
      </p>

      {restaurants.length === 0 ? <div className="empty-state"><span>🏪</span><h3>No restaurants yet</h3><p>Create the first storefront above.</p></div> : <ul className="order-list management-list restaurant-management-list">
        {restaurants.map((restaurant) => (
          <li key={restaurant.id} className="card">
            <span className="item-thumbnail"><Icon name="store" /></span>
            <div className="management-main">
              <strong>{restaurant.name}</strong>
              {restaurant.description && <p>{restaurant.description}</p>}
              <p className="management-meta">Owner: {restaurant.profiles?.full_name || restaurant.profiles?.email || 'Unassigned'}</p>
            </div>
            <div className="menu-item-actions">
              <span className={restaurant.is_active ? 'availability-pill active' : 'availability-pill'}><i />{restaurant.is_active ? 'Active' : 'Inactive'}</span>
              <select
                value={restaurant.owner_id ?? ''}
                onChange={(e) => assignOwner(restaurant.id, e.target.value)}
              >
                <option value="">Unassigned</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.full_name || owner.email}
                  </option>
                ))}
              </select>
              <button className="secondary-button" onClick={() => toggleActive(restaurant)}>
                {restaurant.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </li>
        ))}
      </ul>}
    </div>
  )
}
