import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function StaffLayout() {
  return (
    <div className="staff-shell">
      <Sidebar />
      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
}
