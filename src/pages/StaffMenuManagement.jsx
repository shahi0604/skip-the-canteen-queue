import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import FoodImage from '../components/FoodImage';
import ConfirmDialog from '../components/ConfirmDialog';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { BASE_CATEGORIES } from '../data/initialMenu';
import { formatINR } from '../utils/currency';

const EMPTY = { name: '', description: '', price: '', category: 'Snacks', image: '', veg: true, available: true };

function validate(form) {
  const errors = {};
  const name = form.name.trim();
  if (name.length < 2 || name.length > 40) errors.name = 'Name must be 2 to 40 characters.';
  if (form.description.trim().length > 120) errors.description = 'Keep the description under 120 characters.';
  const price = Number(form.price);
  if (form.price === '' || !Number.isInteger(price) || price < 1 || price > 2000) errors.price = 'Enter a whole price from 1 to 2000.';
  if (!form.category.trim()) errors.category = 'Choose or type a category.';
  if (form.image.trim() && !/^https?:\/\//i.test(form.image.trim())) errors.image = 'Image link must start with http:// or https://';
  return errors;
}

function MenuItemForm({ title, initial, categories, existingNames, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    if (!found.name && existingNames.includes(form.name.trim().toLowerCase())) found.name = 'An item with this name already exists.';
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(form);
  };

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form className="dialog dialog-wide" role="dialog" aria-modal="true" aria-labelledby="item-form-title" onSubmit={submit} noValidate>
        <h2 id="item-form-title">{title}</h2>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="f-name">Name</label>
            <input id="f-name" className={errors.name ? 'input-error' : ''} value={form.name} onChange={set('name')} autoFocus />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div className="field">
            <label htmlFor="f-price">Price (INR)</label>
            <input id="f-price" type="number" min="1" step="1" inputMode="numeric" className={errors.price ? 'input-error' : ''} value={form.price} onChange={set('price')} />
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>
        </div>
        <div className="field">
          <label htmlFor="f-desc">Description</label>
          <textarea id="f-desc" rows="2" className={errors.description ? 'input-error' : ''} value={form.description} onChange={set('description')} />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="f-cat">Category</label>
            <input id="f-cat" list="category-options" className={errors.category ? 'input-error' : ''} value={form.category} onChange={set('category')} />
            <datalist id="category-options">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            {errors.category && <p className="field-error">{errors.category}</p>}
          </div>
          <div className="field">
            <label htmlFor="f-img">Image link (optional)</label>
            <input id="f-img" className={errors.image ? 'input-error' : ''} value={form.image} onChange={set('image')} placeholder="https://..." />
            {errors.image && <p className="field-error">{errors.image}</p>}
          </div>
        </div>
        <div className="check-row">
          <label><input type="checkbox" checked={form.veg} onChange={set('veg')} /> Vegetarian</label>
          <label><input type="checkbox" checked={form.available} onChange={set('available')} /> Available to order</label>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save item</button>
        </div>
      </form>
    </div>
  );
}

export default function StaffMenuManagement() {
  const { menu, addMenuItem, updateMenuItem, setItemAvailability, deleteMenuItem } = useOrders();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [deleting, setDeleting] = useState(null);

  const categories = useMemo(() => [...new Set([...BASE_CATEGORIES, ...menu.map((m) => m.category)])], [menu]);
  const editingId = editing && editing !== 'new' ? editing.id : null;
  const existingNames = menu.filter((m) => m.id !== editingId).map((m) => m.name.trim().toLowerCase());

  const save = (form) => {
    const result = editing === 'new' ? addMenuItem(form) : updateMenuItem(editing.id, form);
    if (result.ok) {
      toast(editing === 'new' ? `${form.name.trim()} added to the menu` : `${form.name.trim()} updated`, 'success');
      setEditing(null);
    } else {
      toast(result.message, 'error');
    }
  };

  const toggle = (item) => {
    const result = setItemAvailability(item.id, !item.available);
    toast(result.ok ? `${item.name} is now ${item.available ? 'unavailable' : 'available'}` : result.message, result.ok ? 'success' : 'error');
  };

  const confirmDelete = () => {
    const result = deleteMenuItem(deleting.id);
    toast(result.ok ? `${deleting.name} deleted` : result.message, result.ok ? 'success' : 'error');
    setDeleting(null);
  };

  return (
    <div className="staff-page">
      <div className="page-head">
        <div>
          <h1>Menu</h1>
          <p className="muted">Changes apply to new orders only. Existing orders keep their original names and prices.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> Add item</button>
      </div>

      {menu.length === 0 ? (
        <div className="empty-state">
          <h2>The menu is empty</h2>
          <p>Add your first food item so students can start ordering.</p>
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>Add item</button>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr></thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="cell-item">
                      <FoodImage className="row-thumb" src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span className="cell-sub">
                          <span className={`veg-dot ${item.veg ? 'veg' : 'nonveg'}`} /> {item.veg ? 'Veg' : 'Non-veg'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{formatINR(item.price)}</td>
                  <td>
                    <button type="button" role="switch" aria-checked={item.available} aria-label={`${item.name} availability`}
                      className={`switch ${item.available ? 'on' : ''}`} onClick={() => toggle(item)}>
                      <span className="switch-knob" />
                      <span className="switch-text">{item.available ? 'Available' : 'Unavailable'}</span>
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}><Pencil size={17} /></button>
                      <button type="button" className="icon-btn danger" aria-label={`Delete ${item.name}`} onClick={() => setDeleting(item)}><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <MenuItemForm
          key={editing === 'new' ? 'new' : editing.id}
          title={editing === 'new' ? 'Add food item' : `Edit ${editing.name}`}
          initial={editing === 'new' ? EMPTY : { name: editing.name, description: editing.description || '', price: String(editing.price), category: editing.category, image: editing.image || '', veg: !!editing.veg, available: !!editing.available }}
          categories={categories}
          existingNames={existingNames}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        danger
        title={`Delete ${deleting ? deleting.name : ''}?`}
        message="It will be removed from the menu and from any cart that contains it. Orders already placed are not changed."
        confirmLabel="Delete item"
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
