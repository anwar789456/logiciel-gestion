import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Home, Bolt, Receipt, ChartNoAxesCombined, MessageCircleMore, ScrollText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
function Sidebar() {
  const { t } = useTranslation();
  const { isSidebarOpen } = useApp();

  const navItems = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: ChartNoAxesCombined, label: t('stats'), path: '/stats' },
    { icon: ScrollText, label: t('devis'), path: '/devis' },
    { icon: Receipt, label: t('factures'), path: '/factures' },
    { icon: MessageCircleMore, label: t('messages'), path: '/messages' },
    { icon: Bolt, label: t('settings'), path: '/settings' },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-[width] duration-300 ${isSidebarOpen ? 'w-48' : 'w-16'}`}
    >
      <div className="p-2">
        <nav className="space-y-5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-s-xs rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
              }
             

              title={!isSidebarOpen ? item.label : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <item.icon size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
