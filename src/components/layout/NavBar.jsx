import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'
import { Icon } from '../ui/Icon'

export function NavBar() {
  const { user, profile, role, signOut } = useAuth()
  const { itemCount } = useCart()
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()
  const navClass = ({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="navbar-shell">
      <div className="navbar">
        <Link to="/" className="navbar-brand" aria-label="FoodOrder home">
          <span className="brand-mark"><Icon name="bag" size={19} /></span>
          <span>Food<span>Order</span></span>
        </Link>

        <nav className="navbar-links" aria-label="Main navigation">
          <NavLink to="/" className={navClass} end><Icon name="home" size={17} />{t.browse}</NavLink>
          {role === 'customer' && (
            <>
              <NavLink to="/my-orders" className={navClass}><Icon name="orders" size={17} />{t.myOrders}</NavLink>
              <NavLink to="/checkout" className={navClass}>
                <Icon name="cart" size={17} />Cart
                {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
              </NavLink>
            </>
          )}
          {role === 'owner' && (
            <>
              <NavLink to="/owner" className={navClass} end><Icon name="home" size={17} />Dashboard</NavLink>
              <NavLink to="/owner/menu" className={navClass}><Icon name="menu" size={17} />Menu</NavLink>
              <NavLink to="/owner/orders" className={navClass}><Icon name="orders" size={17} />Orders</NavLink>
            </>
          )}
          {role === 'admin' && (
            <>
              <NavLink to="/admin/restaurants" className={navClass}><Icon name="store" size={17} />Restaurants</NavLink>
              <NavLink to="/admin/orders" className={navClass}><Icon name="orders" size={17} />All Orders</NavLink>
              <NavLink to="/admin/users" className={navClass}><Icon name="users" size={17} />Users</NavLink>
            </>
          )}
        </nav>

        <div className="navbar-auth">
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'lang-pill lang-pill-active' : 'lang-pill'} onClick={() => setLang('en')} aria-label="Use English">EN</button>
            <button className={lang === 'th' ? 'lang-pill lang-pill-active' : 'lang-pill'} onClick={() => setLang('th')} aria-label="Use Thai">TH</button>
          </div>
          {user ? (
            <>
              <span className="user-avatar">{(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}</span>
              <span className="navbar-user"><strong>{profile?.full_name || profile?.email}</strong><small>{role}</small></span>
              <button className="icon-button" onClick={handleSignOut} aria-label={t.signOut} title={t.signOut}><Icon name="logout" size={18} /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">{t.login}</Link>
              <Link to="/signup" className="button-link">{t.signup}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
