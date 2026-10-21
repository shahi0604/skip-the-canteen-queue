import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';

export default function Cart() {
  const navigate = useNavigate();
  const { lines, total, count, unavailableLines } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container page-pad">
        <div className="empty-state">
          <ShoppingCart size={40} />
          <h1>Your cart is empty</h1>
          <p>Add a few items from the menu to get started.</p>
          <Link to="/menu" className="btn btn-primary">Browse menu</Link>
        </div>
      </div>
    );
  }

  const blocked = unavailableLines.length > 0;

  return (
    <div className="container page-pad">
      <div className="page-head"><h1>Your cart</h1></div>
      <div className="two-col">
        <ul className="card cart-list">
          {lines.map((line) => <CartItem key={line.item.id} line={line} />)}
        </ul>

        <aside className="card summary">
          <h2>Order summary</h2>
          <dl className="summary-rows">
            <div><dt>Items</dt><dd>{count}</dd></div>
            <div><dt>Subtotal</dt><dd>{formatINR(total)}</dd></div>
            <div className="summary-total"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
          </dl>
          {blocked && (
            <p className="alert alert-warning">
              {unavailableLines.map((l) => l.item.name).join(', ')} {unavailableLines.length > 1 ? 'are' : 'is'} unavailable. Remove
              {unavailableLines.length > 1 ? ' them' : ' it'} to check out.
            </p>
          )}
          <button type="button" className="btn btn-primary btn-block" disabled={blocked} onClick={() => navigate('/checkout')}>
            Proceed to checkout <ArrowRight size={18} />
          </button>
          <Link to="/menu" className="btn btn-secondary btn-block">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
