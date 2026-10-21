import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChefHat, LayoutDashboard, RotateCcw, Store, UtensilsCrossed, Clock, ArrowLeftRight } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';

export default function Sidebar() {
  const { resetDemo } = useOrders();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <aside className="sidebar">
      <Link to="/staff" className="brand brand-light">
        <span className="brand-mark">
          <ChefHat size={20} />
        </span>
        <span className="brand-text">Canteen staff</span>
      </Link>

      <nav className="side-nav" aria-label="Staff">
        <NavLink to="/staff" end><LayoutDashboard size={18} /> Orders</NavLink>
        <NavLink to="/staff/menu"><UtensilsCrossed size={18} /> Menu</NavLink>
        <NavLink to="/staff/slots"><Clock size={18} /> Pickup slots</NavLink>
      </nav>

      <div className="side-foot">
        <p className="demo-note">
          <Store size={14} /> Demo access. There is no real staff login in this prototype.
        </p>
        <Link to="/" className="side-link"><ArrowLeftRight size={16} /> Switch to student view</Link>
        <button type="button" className="side-link" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={16} /> Reset demo data
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        danger
        title="Reset demo data?"
        message="This restores the sample menu, slots and orders and clears every cart and order in this browser."
        confirmLabel="Reset data"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemo();
          setConfirmReset(false);
          toast('Demo data restored', 'success');
        }}
      />
    </aside>
  );
}
