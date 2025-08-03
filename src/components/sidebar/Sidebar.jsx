import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Home, Receipt, ChartNoAxesCombined, MessageCircleMore, Boxes, ScrollText, ChevronDown, Clipboard, BellDot, FileText, ChevronsRight, ChevronsLeft, TrendingUp, Brain } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function Sidebar() {
  const { t } = useTranslation();
  const { isSidebarOpen, toggleSidebar } = useApp();
  const [isCommandesOpen, setIsCommandesOpen] = useState(false);
  const [isVentesOpen, setIsVentesOpen] = useState(false);

  const toggleCommandes = () => {
    setIsCommandesOpen(!isCommandesOpen);
  };

  const toggleVentes = () => {
    setIsVentesOpen(!isVentesOpen);
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-[width] duration-300 ${isSidebarOpen ? 'w-60' : 'w-20'} flex flex-col`}
    >
      <button 
        className='absolute transition-colors duration-300 ease-in-out top-2 -right-3.5 w-7 h-7 flex items-center cursor-pointer
        justify-center
        border rounded-full border-gray-200 dark:border-gray-200
        bg-white hover:bg-gray-100 dark:hover:bg-gray-300
        text-gray-900 z-10'

        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (<ChevronsLeft size={20} />) : (<ChevronsRight size={20} />) }
      </button>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <nav className="space-y-5">
          {/* Home */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-s-xs transition-colors duration-300 ease-in-out rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
            }
            title={!isSidebarOpen ? t('home') : undefined}
          >
            <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Home size={24} />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              {t('home')}
            </span>
          </NavLink>

          {/* Stats */}
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
            }
            title={!isSidebarOpen ? t('stats') : undefined}
          >
            <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
              <ChartNoAxesCombined size={24} />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              {t('stats')}
            </span>
          </NavLink>

          <div className={`pt-2 pb-2 transition-normal duration-300 ${isSidebarOpen ? 'pl-2 text-sm' : 'pl-0 text-[11px]' }`}>
            <p className='font-semibold uppercase whitespace-nowrap transition-all duration-300 ease-in-out text-gray-400 dark:text-gray-500'>
              {t('documents')}
            </p>
          </div>

          {/* Ventes Dropdown */}
          <div>
            <button
              onClick={toggleVentes}
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/devis') || location.pathname.startsWith('/factures')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
              title={!isSidebarOpen ? t('ventes') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('ventes')}
              </span>
              <div className={`ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className={`transform transition-transform duration-300 ease-in-out ${isVentesOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>
            
            {/* Dropdown Items with smooth animation */}
            <div 
              className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isVentesOpen && isSidebarOpen 
                  ? 'max-h-32 opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Devis */}
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isVentesOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isVentesOpen ? '0ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/devis"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <ScrollText size={20} />
                    </div>
                    {t('devis')}
                  </NavLink>
                </div>

                {/* Commandes en cours */}
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isVentesOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isVentesOpen ? '50ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/commandes/en-cours"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <BellDot size={20} />
                    </div>
                    {t('commandes_en_cours')}
                  </NavLink>
                </div>

                {/* Factures */}
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isVentesOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isVentesOpen ? '50ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/factures"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Receipt size={20} />
                    </div>
                    {t('factures')}
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          <div className={`pt-2 pb-2 transition-normal duration-300 ${isSidebarOpen ? 'pl-2 text-sm' : 'pl-0 text-[11px]' }`}>
            <p className='font-semibold uppercase whitespace-nowrap transition-all duration-300 ease-in-out text-gray-400 dark:text-gray-500'>
              {t('fiches')}
            </p>
          </div>
          
          {/* Commandes Dropdown */}
          <div>
            <button
              onClick={toggleCommandes}
              className={`w-full cursor-pointer flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname.startsWith('/commandes') ? 'pl-2   text-blue-600 dark:text-blue-50' : ''}`}
              title={!isSidebarOpen ? t('commandes') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Clipboard size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('commandes')}
              </span>
              <div className={`ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className={`transform transition-transform duration-300 ease-in-out ${isCommandesOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>
            
            {/* Dropdown Items with smooth animation */}
            <div 
              className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isCommandesOpen && isSidebarOpen 
                  ? 'max-h-32 opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Fiche Commandes */}
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isCommandesOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isCommandesOpen ? '0ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/commandes/fiche"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    {t('fiche_commandes')}
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
            }
            title={!isSidebarOpen ? t('messages') : undefined}
          >
            <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
              <MessageCircleMore size={24} />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              {t('messages')}
            </span>
          </NavLink>

          <div className={`pt-2 pb-2 transition-normal duration-300 ${isSidebarOpen ? 'pl-2 text-sm' : 'pl-0 text-[11px]' }`}>
            <p className='font-semibold uppercase whitespace-nowrap transition-all duration-300 ease-in-out text-gray-400 dark:text-gray-500'>
              stock
            </p>
          </div>

          <NavLink
            to="/stock"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
            }
            title={!isSidebarOpen ? 'stock' : undefined}
          >
            <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Boxes size={24} />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              Stock
            </span>
          </NavLink>

          <NavLink
            to="/assistant-ia"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
            }
            title={!isSidebarOpen ? 'stock' : undefined}
          >
            <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Brain size={24} />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              Assistant IA
            </span>
          </NavLink>

        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;