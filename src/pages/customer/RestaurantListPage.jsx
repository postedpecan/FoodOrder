import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { RestaurantCard } from '../../components/restaurant/RestaurantCard'
import { useLanguage } from '../../context/LanguageContext'
import { Icon } from '../../components/ui/Icon'

export function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const { t, categoryLabel, categories } = useLanguage()

  useEffect(() => {
    let isMounted = true
    supabase
      .from('restaurants')
      .select('id, name, description, description_th, category, specialty_item')
      .eq('is_active', true)
      .order('name')
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) setError(error.message)
        else setRestaurants(data)
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return restaurants.filter((r) => {
      const matchesCategory = activeCategory === 'All' || r.category === activeCategory
      const matchesSearch =
        !query || r.name.toLowerCase().includes(query) || (r.description ?? '').toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [restaurants, search, activeCategory])

  if (loading) return <p className="page-status">Loading restaurants...</p>
  if (error) return <p className="page-status form-error">{error}</p>

  return (
    <div className="customer-home">
      <section className="food-hero">
        <div className="hero-copy">
          <span className="eyebrow"><Icon name="spark" size={16} />Fresh picks around campus</span>
          <h1 className="page-heading">{t.heading}</h1>
          <p className="page-subheading">{t.subheading}</p>
          <label className="search-wrap">
            <Icon name="search" size={21} />
            <input
              className="search-bar"
              type="search"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-action">Search</span>
          </label>
          <div className="hero-points">
            <span><strong>01</strong> Choose a place</span>
            <span><strong>02</strong> Pick your meal</span>
            <span><strong>03</strong> Collect when ready</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="hero-orbit hero-orbit-one">🍜</span>
          <span className="hero-orbit hero-orbit-two">🍕</span>
          <span className="hero-orbit hero-orbit-three">🥗</span>
          <div className="hero-plate"><span>🍱</span></div>
          <div className="hero-rating"><span>★</span><strong>Campus favorites</strong><small>All in one place</small></div>
        </div>
      </section>

      <section className="browse-section">
        <div className="section-heading">
          <div><span className="section-kicker">Browse by taste</span><h2>Explore restaurants</h2></div>
          <span className="result-count">{filtered.length} {filtered.length === 1 ? 'place' : 'places'}</span>
        </div>
        <div className="filter-chips">
        {['All', ...categories].map((category) => (
          <button
            key={category}
            className={activeCategory === category ? 'chip chip-active' : 'chip'}
            onClick={() => setActiveCategory(category)}
          >
            {categoryLabel(category)}
          </button>
        ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><span>🍽️</span><h3>Nothing on this plate yet</h3><p>{restaurants.length === 0 ? 'No restaurants available yet.' : t.noRestaurants}</p></div>
        ) : (
          <div className="card-grid restaurant-grid">
            {filtered.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        )}
      </section>
    </div>
  )
}
