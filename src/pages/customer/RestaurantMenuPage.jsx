import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { MenuItemCard } from '../../components/restaurant/MenuItemCard'
import { useLanguage } from '../../context/LanguageContext'
import { Icon } from '../../components/ui/Icon'
import { normalizeMenuPrice } from '../../utils/studentPricing'

export function RestaurantMenuPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addItem, itemCount } = useCart()
  const { lang, categoryLabel } = useLanguage()
  const navigate = useNavigate()

  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const [{ data: restaurantData, error: restaurantError }, { data: itemsData, error: itemsError }] =
        await Promise.all([
          supabase.from('restaurants').select('id, name, description, description_th, category, specialty_item').eq('id', id).single(),
          supabase
            .from('menu_items')
            .select('id, name, description, price, is_available')
            .eq('restaurant_id', id)
            .order('name'),
        ])

      if (!isMounted) return
      if (restaurantError) setError(restaurantError.message)
      else setRestaurant(restaurantData)
      if (itemsError) setError(itemsError.message)
      else setMenuItems(itemsData.map((item) => ({ ...item, price: normalizeMenuPrice(item.price) })))
      setLoading(false)
    }

    load()
    return () => {
      isMounted = false
    }
  }, [id])

  function handleAdd(item) {
    if (!user) {
      navigate('/login')
      return
    }
    addItem(id, restaurant.name, item)
  }

  if (loading) return <p className="page-status">Loading menu...</p>
  if (error) return <p className="page-status form-error">{error}</p>
  if (!restaurant) return <p className="page-status">Restaurant not found.</p>

  const description = (lang === 'th' && restaurant.description_th) || restaurant.description

  return (
    <div className="menu-page">
      <Link to="/" className="back-link">← Back to restaurants</Link>
      <section className="restaurant-hero">
        <div className="restaurant-hero-copy">
          {restaurant.category && <span className="eyebrow">{categoryLabel(restaurant.category)}</span>}
          <h1>{restaurant.name}</h1>
          {description && <p>{description}</p>}
          <div className="restaurant-meta">
            <span><Icon name="clock" size={17} />Made fresh to order</span>
            {restaurant.specialty_item && <span><Icon name="spark" size={17} />Known for {restaurant.specialty_item}</span>}
          </div>
        </div>
        <div className="restaurant-hero-art" aria-hidden="true"><span>🍲</span><small>Fresh • Local • Easy</small></div>
      </section>

      <div className="section-heading menu-heading">
        <div><span className="section-kicker">Choose your favorites</span><h2>Our menu</h2></div>
        {itemCount > 0 && <Link className="cart-shortcut" to="/checkout"><Icon name="cart" size={18} />View cart <span>{itemCount}</span></Link>}
      </div>

      {menuItems.length === 0 ? <div className="empty-state"><span>🧑‍🍳</span><h3>The kitchen is getting ready</h3><p>No menu items yet.</p></div> : (
        <div className="card-grid menu-grid">{menuItems.map((item) => <MenuItemCard key={item.id} item={item} onAdd={handleAdd} />)}</div>
      )}
    </div>
  )
}
