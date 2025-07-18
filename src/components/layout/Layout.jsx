import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import { useApp } from '../../context/AppContext';

function Layout() {
  const { isSidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar />
      <main
        className={`h-screen pt-16 transition-all duration-300 ${isSidebarOpen ? 'pl-48' : 'pl-16'}`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;