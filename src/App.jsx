import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import StudentLayout from './components/StudentLayout';
import StaffLayout from './components/StaffLayout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import StaffDashboard from './pages/StaffDashboard';
import StaffMenuManagement from './pages/StaffMenuManagement';
import StaffSlotManagement from './pages/StaffSlotManagement';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="container empty-state page-pad">
      <h1>Page not found</h1>
      <p>That address does not exist in this app.</p>
      <Link className="btn btn-primary" to="/">Back to home</Link>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <OrderProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<StudentLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="menu" element={<StaffMenuManagement />} />
              <Route path="slots" element={<StaffSlotManagement />} />
            </Route>
          </Routes>
        </CartProvider>
      </OrderProvider>
    </ToastProvider>
  );
}
