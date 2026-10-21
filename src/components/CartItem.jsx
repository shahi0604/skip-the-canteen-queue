import { Trash2 } from 'lucide-react';
import FoodImage from './FoodImage';
import QtyStepper from './QtyStepper';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

export default function CartItem({ line }) {
  const { setQuantity, removeItem } = useCart();
  const toast = useToast();
  const { item, quantity } = line;

  const handleChange = (next) => {
    const result = setQuantity(item.id, next);
    if (!result.ok) toast(result.message, 'warning');
  };

  return (
    <li className={`cart-item ${!item.available ? 'is-unavailable' : ''}`}>
      <FoodImage className="cart-thumb" src={item.image} alt={item.name} />
      <div className="cart-info">
        <h3>{item.name}</h3>
        <p className="muted">{formatINR(item.price)} each</p>
        {!item.available && <span className="chip chip-full">Unavailable. Remove to continue.</span>}
      </div>
      <QtyStepper value={quantity} onChange={handleChange} label={item.name} />
      <strong className="cart-line-total">{formatINR(item.price * quantity)}</strong>
      <button
        type="button"
        className="icon-btn"
        aria-label={`Remove ${item.name}`}
        onClick={() => {
          removeItem(item.id);
          toast(`${item.name} removed`, 'info');
        }}
      >
        <Trash2 size={18} />
      </button>
    </li>
  );
}
