import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { useOrders } from '../context/OrderContext';
import useLoading from '../hooks/useLoading';

export default function Menu() {
  const { menu } = useOrders();
  const [params, setParams] = useSearchParams();
  const loading = useLoading();
  const q = params.get('q') || '';
  const category = params.get('category') || 'All';

  const categories = useMemo(() => ['All', ...new Set(menu.map((m) => m.category))], [menu]);

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    return menu.filter(
      (m) => (category === 'All' || m.category === category) && (!term || m.name.toLowerCase().includes(term))
    );
  }, [menu, q, category]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'All') next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <div className="container page-pad">
      <div className="page-head">
        <div>
          <h1>Menu</h1>
          <p className="muted">Pick what you like. Unavailable items are marked and cannot be added.</p>
        </div>
      </div>

      <div className="toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search by food name"
            value={q}
            onChange={(e) => update('q', e.target.value)}
            aria-label="Search by food name"
          />
          {q && (
            <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => update('q', '')}>
              <X size={16} />
            </button>
          )}
        </label>
        <div className="chip-row" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-chip ${category === c ? 'active' : ''}`}
              aria-pressed={category === c}
              onClick={() => update('category', c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="food-grid" aria-busy="true">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h2>No food matches your search</h2>
          <p>Try a different name or clear the filters.</p>
          <button type="button" className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="muted result-count">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          <div className="food-grid">{items.map((item) => <FoodCard key={item.id} item={item} />)}</div>
        </>
      )}
    </div>
  );
}
