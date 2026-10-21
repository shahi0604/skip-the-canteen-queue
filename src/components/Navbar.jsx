import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChefHat, Menu as MenuIcon, ShoppingCart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">
            <ChefHat size={20} />
          </span>
          <span className="brand-text">Skip the Canteen Queue</span>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/menu" onClick={close}>Menu</NavLink>
          <NavLink to="/my-orders" onClick={close}>My orders</NavLink>
          <Link to="/staff" className="demo-switch" onClick={close} title="Demo access only. This is not real authentication.">
            Demo: open staff view
          </Link>
        </nav>

        <div className="nav-actions">
          <Link to="/cart" className="cart-link" aria-label={`Cart, ${count} items`}>
            <ShoppingCart size={20} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          <button
            type="button"
            className="icon-btn nav-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
