import { formatCurrency } from '../../utils/formatCurrency'
import { Icon } from '../ui/Icon'

export function MenuItemCard({ item, onAdd }) {
  return (
    <article className={`card menu-item-card${item.is_available ? '' : ' menu-item-unavailable'}`}>
      <div className="menu-item-art" aria-hidden="true"><span>🍴</span></div>
      <div className="menu-item-copy">
        <h4>{item.name}</h4>
        {item.description && <p>{item.description}</p>}
        <div className="menu-item-footer"><p className="price">{formatCurrency(item.price)}</p>
          {item.is_available ? (
            <button className="add-button" onClick={() => onAdd(item)} aria-label={`Add ${item.name} to cart`}><Icon name="plus" size={18} /> Add</button>
          ) : <span className="unavailable">Unavailable</span>}
        </div>
      </div>
    </article>
  )
}
