import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Icon } from '../../components/ui/Icon'

export function OwnerDashboardPage() {
  const { user } = useAuth()
  const { categories } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ category: '', specialty_item: '', description_th: '' })

  useEffect(() => {
    let isMounted = true
    supabase
      .from('restaurants')
      .select('id, name, description, is_active, category, specialty_item, description_th')
      .eq('owner_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) setError(error.message)
        else {
          setRestaurant(data)
          if (data) {
            setForm({
              category: data.category ?? '',
              specialty_item: data.specialty_item ?? '',
              description_th: data.description_th ?? '',
            })
          }
        }
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [user.id])

  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          category: form.category || null,
          specialty_item: form.specialty_item || null,
          description_th: form.description_th || null,
        })
        .eq('id', restaurant.id)
      if (error) throw error
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="page-status">Loading...</p>
  if (error) return <p className="page-status form-error">{error}</p>

  if (!restaurant) {
    return (
      <div>
        <h2>Owner dashboard</h2>
        <p>No restaurant is assigned to your account yet. Ask an admin to assign you as an owner.</p>
      </div>
    )
  }

  return (
    <div className="operations-page">
      <section className="operations-hero">
        <div><span className="section-kicker">Restaurant workspace</span><h1>{restaurant.name}</h1>{restaurant.description && <p>{restaurant.description}</p>}</div>
        <span className={restaurant.is_active ? 'availability-pill active' : 'availability-pill'}><i />{restaurant.is_active ? 'Active storefront' : 'Inactive storefront'}</span>
      </section>
      <div className="dashboard-links">
        <Link to="/owner/menu" className="action-tile"><span><Icon name="menu" /></span><div><strong>Manage menu</strong><small>Add dishes and control availability</small></div><Icon name="arrow" /></Link>
        <Link to="/owner/orders" className="action-tile"><span><Icon name="orders" /></span><div><strong>Incoming orders</strong><small>Prepare and update customer orders</small></div><Icon name="arrow" /></Link>
      </div>

      <section className="card settings-card">
      <div className="panel-heading"><div><span className="section-kicker">Store settings</span><h2>Storefront details</h2></div><span className="panel-icon"><Icon name="store" /></span></div>
      <p className="hint panel-intro">
        These show up on your restaurant's card on the homepage: which category it's filed under, your
        standout dish, and a Thai translation of your description for customers who switch the site to Thai.
      </p>
      <form onSubmit={handleSave} className="settings-form">
        <label>
          Category
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Not set</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Known for (signature dish)
          <input
            type="text"
            placeholder="e.g. Margherita Pizza"
            value={form.specialty_item}
            onChange={(e) => setForm({ ...form, specialty_item: e.target.value })}
          />
        </label>
        <label>
          Description (Thai)
          <textarea
            placeholder="คำอธิบายร้านของคุณเป็นภาษาไทย"
            value={form.description_th}
            onChange={(e) => setForm({ ...form, description_th: e.target.value })}
            rows={3}
          />
        </label>
        {saved && <p className="form-success">✓ Saved.</p>}
        <button type="submit" disabled={saving} className="save-button">
          {saving ? 'Saving...' : 'Save storefront details'}
        </button>
      </form>
      </section>
    </div>
  )
}
