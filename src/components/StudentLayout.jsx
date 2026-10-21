import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function StudentLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <strong>Skip the Canteen Queue.</strong> Order Ahead. Skip the Wait.
          <p>
            Prototype notes: data is stored in this browser only, so orders placed here are not visible on other
            devices. Staff access is a demo link, not real authentication.
          </p>
        </div>
      </footer>
    </div>
  );
}
