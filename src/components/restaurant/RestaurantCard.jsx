import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { Icon } from '../ui/Icon'

const CATEGORY_HUES = {
  Italian: 25,
  Indian: 25,
  Japanese: 195,
  Dessert: 195,
  American: 45,
  Barbecue: 45,
  Mexican: 85,
  Bakery: 85,
  Asian: 150,
  Healthy: 150,
}
const DEFAULT_HUE = 40
const CATEGORY_ICONS = {
  Italian: '🍝', Indian: '🍛', Japanese: '🍣', Dessert: '🧁', American: '🍔',
  Barbecue: '🍖', Mexican: '🌮', Bakery: '🥐', Asian: '🍜', Healthy: '🥗',
}

export function RestaurantCard({ restaurant }) {
  const { lang, t, categoryLabel } = useLanguage()
  const hue = CATEGORY_HUES[restaurant.category] ?? DEFAULT_HUE
  const description = (lang === 'th' && restaurant.description_th) || restaurant.description

  return (
    <Link to={`/restaurants/${restaurant.id}`} className="card restaurant-card">
      <div
        className="restaurant-card-header"
        style={{ background: `linear-gradient(135deg, oklch(94% 0.05 ${hue}), oklch(88% 0.08 ${hue}))` }}
      >
        <span className="restaurant-card-blob" />
        <span className="restaurant-card-emoji">{CATEGORY_ICONS[restaurant.category] || '🍽️'}</span>
        <span className="open-pill">Open today</span>
      </div>
      <div className="restaurant-card-body">
        {restaurant.category && (
          <span
            className="restaurant-tag"
            style={{ color: `oklch(38% 0.14 ${hue})`, background: `oklch(93% 0.06 ${hue})` }}
          >
            {categoryLabel(restaurant.category)}
          </span>
        )}
        <div className="restaurant-title-row"><h3>{restaurant.name}</h3><span className="round-arrow"><Icon name="arrow" size={16} /></span></div>
        {description && <p>{description}</p>}
        {restaurant.specialty_item && (
          <p className="restaurant-specialty">
            {t.knownFor} {restaurant.specialty_item}
          </p>
        )}
        <span className="restaurant-view-link">{t.viewMenu}</span>
      </div>
    </Link>
  )
}
