import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, Search, Ticket, Utensils, Clock, ChefHat, ShoppingCart } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import FoodImage from '../components/FoodImage';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

const STEPS = [
  { icon: Utensils, title: 'Pick your food', text: 'Browse today\u2019s menu and add what you want to the cart.' },
  { icon: Clock, title: 'Choose a pickup slot', text: 'Select a 10-minute window that fits your break. Full slots are locked.' },
  { icon: Ticket, title: 'Get your token', text: 'Confirm the order and receive a unique token like A105.' },
  { icon: ChefHat, title: 'Walk in and collect', text: 'Show your token when the status turns to Ready for Pickup.' },
];

function MenuRow({ item }) {
  const { addItem } = useCart();
  const toast = useToast();
  return (
    <li className="menu-row">
      <FoodImage className="row-thumb" src={item.image} alt={item.name} />
      <div className="row-info">
        <strong>{item.name}</strong>
        <span className="muted">{item.category}</span>
      </div>
      <span className="price">{formatINR(item.price)}</span>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => {
          const r = addItem(item.id);
          toast(r.message, r.ok ? 'success' : 'error');
        }}
      >
        Add
      </button>
    </li>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { menu, orders, student } = useOrders();
  const { count } = useCart();
  const [query, setQuery] = useState('');

  const categories = [...new Set(menu.map((m) => m.category))];
  const popular = menu.filter((m) => m.popular && m.available).slice(0, 4);
  const recommended = menu.filter((m) => m.recommended && m.available).slice(0, 4);
  const todays = menu.filter((m) => m.available);
  const waiting = orders.filter((o) => o.status === 'Order Placed' || o.status === 'Preparing').length;

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/menu?q=${encodeURIComponent(q)}` : '/menu');
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Order Ahead. Skip the Wait.</h1>
            <p className="hero-sub">
              Pre-order from the canteen, pick a pickup slot and collect your food with a token. Your break is for
              eating, not for standing in line.
            </p>
            <form className="hero-search" onSubmit={onSearch} role="search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search for dosa, burger, tea..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search food items"
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
            <div className="hero-cta">
              <Link to="/menu" className="btn btn-primary">View menu <ArrowRight size={18} /></Link>
              <Link to="/my-orders" className="btn btn-secondary"><ClipboardList size={18} /> Current orders</Link>
              {count > 0 && (
                <Link to="/cart" className="btn btn-ghost"><ShoppingCart size={18} /> Cart ({count})</Link>
              )}
            </div>
          </div>

          <div className="ticket hero-ticket" aria-hidden="true">
            <div className="ticket-top">
              <span>Sample token</span>
              <strong className="ticket-token">A105</strong>
            </div>
            <div className="ticket-cut" />
            <div className="ticket-bottom">
              <div><span className="muted">Pickup</span><strong>10:40 AM - 10:50 AM</strong></div>
              <div><span className="muted">Status</span><strong>Preparing</strong></div>
              <div><span className="muted">Queue right now</span><strong>{waiting} orders in kitchen</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">Browse by category</h2>
        <div className="chip-row">
          {categories.map((c) => (
            <Link key={c} className="filter-chip" to={`/menu?category=${encodeURIComponent(c)}`}>{c}</Link>
          ))}
        </div>
      </section>

      {popular.length > 0 && (
        <section className="container section">
          <div className="section-head">
            <h2 className="section-title">Popular right now</h2>
            <Link to="/menu" className="text-link">See full menu <ArrowRight size={16} /></Link>
          </div>
          <div className="food-grid">{popular.map((item) => <FoodCard key={item.id} item={item} />)}</div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Quick picks for a short break</h2>
          <div className="food-grid">{recommended.map((item) => <FoodCard key={item.id} item={item} />)}</div>
        </section>
      )}

      <section className="container section">
        <h2 className="section-title">Today&rsquo;s available menu</h2>
        {todays.length === 0 ? (
          <div className="empty-state"><p>Nothing is available right now. Check back soon.</p></div>
        ) : (
          <ul className="card menu-list">{todays.map((item) => <MenuRow key={item.id} item={item} />)}</ul>
        )}
      </section>

      <section className="container section">
        <h2 className="section-title">How it works</h2>
        <ol className="steps">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card step">
              <span className="step-num">{i + 1}</span>
              <Icon size={22} className="step-icon" />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        {student && (
          <p className="muted center-note">Welcome back, {student.name || student.studentId}. <Link className="text-link" to="/my-orders">Track your orders</Link></p>
        )}
      </section>
    </>
  );
}
