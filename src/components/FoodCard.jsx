import { Plus } from 'lucide-react';
import FoodImage from './FoodImage';
import QtyStepper from './QtyStepper';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

export default function FoodCard({ item }) {
  const { getQuantity, addItem, setQuantity } = useCart();
  const toast = useToast();
  const qty = getQuantity(item.id);
  const unavailable = !item.available;

  const handleAdd = () => {
    const result = addItem(item.id);
    toast(result.message, result.ok ? 'success' : 'error');
  };

  const handleChange = (next) => {
    const result = setQuantity(item.id, next);
    if (!result.ok) toast(result.message, 'warning');
  };

  return (
    <article className={`food-card ${unavailable ? 'is-unavailable' : ''}`}>
      <div className="food-media">
        <FoodImage src={item.image} alt={item.name} />
        {unavailable && <span className="unavail-tag">Unavailable</span>}
        {!unavailable && item.popular && <span className="pop-tag">Popular</span>}
      </div>
      <div className="food-body">
        <div className="food-meta">
          <span className="category-pill">{item.category}</span>
          <span
            className={`veg-dot ${item.veg ? 'veg' : 'nonveg'}`}
            title={item.veg ? 'Vegetarian' : 'Non-vegetarian'}
            aria-label={item.veg ? 'Vegetarian' : 'Non-vegetarian'}
          />
        </div>
        <h3>{item.name}</h3>
        <p className="food-desc">{item.description}</p>
        <div className="food-foot">
          <div className="food-price">
            <span className="price">{formatINR(item.price)}</span>
            <span className={`avail ${unavailable ? 'avail-no' : 'avail-yes'}`}>
              {unavailable ? 'Unavailable' : 'Available'}
            </span>
          </div>
          {unavailable ? (
            <button type="button" className="btn btn-secondary btn-sm" disabled>
              Unavailable
            </button>
          ) : qty === 0 ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
              <Plus size={16} /> Add to cart
            </button>
          ) : (
            <QtyStepper value={qty} onChange={handleChange} label={item.name} />
          )}
        </div>
      </div>
    </article>
  );
}
