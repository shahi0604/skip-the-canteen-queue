const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=70`;

export const BASE_CATEGORIES = ['Sandwiches', 'Meals', 'Snacks', 'Beverages'];

export function getInitialMenu() {
  return [
    { id: 'item-1', name: 'Veg Sandwich', description: 'Grilled bread with cucumber, tomato, onion and mint chutney.', price: 40, category: 'Sandwiches', veg: true, popular: false, recommended: true, available: true, image: img('photo-1528735602780-2552fd46c7af') },
    { id: 'item-2', name: 'Chicken Burger', description: 'Crispy chicken patty, lettuce and house sauce in a toasted bun.', price: 80, category: 'Sandwiches', veg: false, popular: true, recommended: false, available: true, image: img('photo-1568901346375-23c9450c58cd') },
    { id: 'item-3', name: 'Masala Dosa', description: 'Crisp rice crepe filled with spiced potato, served with sambar and chutney.', price: 50, category: 'Meals', veg: true, popular: true, recommended: false, available: true, image: img('photo-1668236543090-82eba5ee5976') },
    { id: 'item-4', name: 'Veg Fried Rice', description: 'Wok-tossed rice with carrots, beans and spring onion.', price: 70, category: 'Meals', veg: true, popular: false, recommended: false, available: true, image: img('photo-1603133872878-684f208fb84b') },
    { id: 'item-5', name: 'Fresh Juice', description: 'Seasonal fruit pressed fresh with no added sugar.', price: 30, category: 'Beverages', veg: true, popular: false, recommended: true, available: true, image: img('photo-1600271886742-f049cd451bba') },
    { id: 'item-6', name: 'Paneer Roll', description: 'Spiced paneer, onions and mint wrapped in a soft paratha.', price: 60, category: 'Snacks', veg: true, popular: true, recommended: false, available: true, image: img('photo-1626700051175-6818013e1d4f') },
    { id: 'item-7', name: 'French Fries', description: 'Golden fries tossed in peri-peri seasoning.', price: 50, category: 'Snacks', veg: true, popular: true, recommended: false, available: true, image: img('photo-1573080496219-bb080dd4f877') },
    { id: 'item-8', name: 'Chicken Sandwich', description: 'Shredded chicken, cheese and crunchy slaw in toasted bread.', price: 70, category: 'Sandwiches', veg: false, popular: false, recommended: false, available: true, image: img('photo-1606755962773-d324e0a13086') },
    { id: 'item-9', name: 'Veg Puff', description: 'Flaky pastry with a spiced vegetable filling, baked fresh.', price: 20, category: 'Snacks', veg: true, popular: false, recommended: true, available: true, image: img('photo-1601050690597-df0568f70950') },
    { id: 'item-10', name: 'Tea', description: 'Hot masala chai brewed with ginger and cardamom.', price: 15, category: 'Beverages', veg: true, popular: false, recommended: true, available: true, image: img('photo-1556679343-c7306c1976bc') },
  ];
}
