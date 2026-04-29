import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import { useApp } from '../../context/AppContext';

function Layout() {
  const { isSidebarOpen, toggleSidebar } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Navbar />
      <Sidebar />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/40 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      <main
        className={`pt-16 transition-all duration-300 pl-0 ${isSidebarOpen ? 'md:pl-60' : 'md:pl-20'}`}
      >
        <div className="px-3 sm:px-4 md:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;