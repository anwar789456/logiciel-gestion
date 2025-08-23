import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { Receipt, LayoutGrid, MessageCircleMore, List, CalendarDays, QrCode, GalleryHorizontal, TicketCheck, ScrollText, ChevronDown, Clipboard, BellDot, FileText, ChevronsRight, ChevronsLeft, TrendingUp, Brain, Truck, Users, TrendingDown, UserCheck, Calendar, Wallet, Globe, Tag, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';

function Sidebar() {
  const { t } = useTranslation();
  const { isSidebarOpen, toggleSidebar } = useApp();
  const { canAccess } = useAuth();
  const location = useLocation();
  const [isCommandesOpen, setIsCommandesOpen] = useState(false);
  const [isVentesOpen, setIsVentesOpen] = useState(false);
  const [isAchatsOpen, setIsAchatsOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [isWebsiteOpen, setIsWebsiteOpen] = useState(false);
  const [isCongeOpen, setIsCongeOpen] = useState(false);
  
  // Helper functions to check if any routes in a dropdown are accessible
  // If all routes are denied access, we should hide the dropdown
  const hasAccessToVentesRoutes = () => {
    const routes = ['devis', 'factures', 'bon-de-livraison', 'recue-de-paiement-sur-commande'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToAchatsRoutes = () => {
    const routes = ['fournisseur'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToCommandesRoutes = () => {
    const routes = ['commandes-fiche'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToEmployeeRoutes = () => {
    const routes = ['users-list', 'employee-list', 'demande-conge'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToCongeRoutes = () => {
    const routes = ['employee-demande-conge', 'employee-liste-conge'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToWebsiteRoutes = () => {
    const routes = ['stock', 'categories', 'products', 'carousel', 'qr-code'];
    return routes.some(route => canAccess(route));
  };

  const toggleCommandes = () => {
    setIsCommandesOpen(!isCommandesOpen);
  };

  const toggleVentes = () => {
    setIsVentesOpen(!isVentesOpen);
  };

  const toggleAchats = () => {
    setIsAchatsOpen(!isAchatsOpen);
  };

  const toggleEmployee = () => {
    setIsEmployeeOpen(!isEmployeeOpen);
  };

  const toggleWebsite = () => {
    setIsWebsiteOpen(!isWebsiteOpen);
  };

  const toggleConge = () => {
    setIsCongeOpen(!isCongeOpen);
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
        <nav className="space-y-0.5">
          {/* Home */}
          {/* <NavLink
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
          </NavLink> */}

          {/* Stats */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
            }
            title={!isSidebarOpen ? t('dashboard') : undefined}
          >
            <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
              <LayoutGrid size={24} />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              {t('home')}
            </span>
          </NavLink>

          {/* Agenda */}
          {canAccess('agenda') && (
            <NavLink
              to="/agenda"
              end
              className={({ isActive }) =>
                `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
              }
              title={!isSidebarOpen ? t('agenda') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('agenda')}
              </span>
            </NavLink>
          )}

          {(canAccess('devis') || canAccess('factures') || canAccess('bon-livraison') || canAccess('recue-de-paiement-sur-commande')) && (
            <div className={`pt-2 pb-2 transition-normal duration-300 ${isSidebarOpen ? 'pl-2 text-sm' : 'pl-0 text-[11px]' }`}>
              <p className='font-semibold uppercase whitespace-nowrap transition-all duration-300 ease-in-out text-gray-400 dark:text-gray-500'>
                {t('documents')}
              </p>
            </div>
          )}

          {/* Ventes Dropdown */}
          {hasAccessToVentesRoutes() && (
            <div>
              <button
              onClick={toggleVentes}
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/devis') || location.pathname.startsWith('/factures') || location.pathname.startsWith('/bon-livraison')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
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
                  ? 'max-h-44 opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Devis */}
                {canAccess('devis') && (
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
                )}

                {/* Factures */}
                {canAccess('factures') && (
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
                )}

                {/* Bon Livraison */}
                {canAccess('bon-livraison') && (
                  <div
                    className={`transform transition-all duration-300 ease-in-out ${
                      isVentesOpen && isSidebarOpen
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-2 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isVentesOpen ? '100ms' : '0ms'
                    }}
                  >
                    <NavLink
                      to="/bon-livraison"
                      className={({ isActive }) =>
                        `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                      }
                    >
                      <div className="mr-2 flex items-center justify-center flex-shrink-0">
                        <Truck size={20} />
                      </div>
                      {t('bon_livraison')}
                    </NavLink>
                  </div>
                )}

                {/* Reçu de paiement sur commande */}
                {canAccess('recue-de-paiement-sur-commande') && (
                  <div
                    className={`transform transition-all duration-300 ease-in-out ${
                      isVentesOpen && isSidebarOpen
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-2 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isVentesOpen ? '150ms' : '0ms'
                    }}
                  >
                    <NavLink
                      to="/recue-de-paiement-sur-commande"
                      className={({ isActive }) =>
                        `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                      }
                    >
                      <div className="mr-2 flex items-center justify-center flex-shrink-0">
                        <TicketCheck size={20} />
                      </div>
                      {t('recu_de_paiement_sur_commande')}
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Achats Dropdown */}
          {hasAccessToAchatsRoutes() && (
            <div>
              <button
              onClick={toggleAchats}
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname.startsWith('/fournisseur') ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
              title={!isSidebarOpen ? t('achats') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <TrendingDown size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('achats')}
              </span>
              <div className={`ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className={`transform transition-transform duration-300 ease-in-out ${isAchatsOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>
            
            {/* Dropdown Items with smooth animation */}
            <div 
              className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isAchatsOpen && isSidebarOpen 
                  ? 'max-h-20 opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Fournisseur */}
                {canAccess('fournisseur') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isAchatsOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isAchatsOpen ? '0ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/fournisseur"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Users size={20} />
                    </div>
                    {t('fournisseur')}
                  </NavLink>
                </div>
                )}
              </div>
            </div>
          </div>
          )}

          {hasAccessToCommandesRoutes() && (
          <div className={`pt-2 pb-2 transition-normal duration-300 ${isSidebarOpen ? 'pl-2 text-sm' : 'pl-0 text-[11px]' }`}>
            <p className='font-semibold uppercase whitespace-nowrap transition-all duration-300 ease-in-out text-gray-400 dark:text-gray-500'>
              {t('fiches')}
            </p>
          </div>
          )}

          {/* Commandes Dropdown */}
          {hasAccessToCommandesRoutes() && (
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
                {canAccess('commandes-fiche') && (
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
                      to="/commandes-fiche"
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
                )}
              </div>
            </div>
          </div>
          )}

          {/* Clients */}
          {canAccess('clients') && (
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
            }
            title={!isSidebarOpen ? t('clients') : undefined}
          >
            <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Users size={24} />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              {t('clients')}
            </span>
          </NavLink>
          )}

          {/* Employée Dropdown */}
          {hasAccessToEmployeeRoutes() && (
            <div>
              <button
              onClick={toggleEmployee}
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/employee') || location.pathname.startsWith('/demande-conge')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
              title={!isSidebarOpen ? t('employee') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <UserCheck size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('employee')}
              </span>
              <div className={`ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className={`transform transition-transform duration-300 ease-in-out ${isEmployeeOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>
            
            {/* Dropdown Items with smooth animation */}
            <div 
              className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isEmployeeOpen && isSidebarOpen 
                  ? 'max-h-48 opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* User List - Admin Only */}
                {canAccess('users-list') && (
                  <div
                    className={`transform transition-all duration-300 ease-in-out ${
                      isEmployeeOpen && isSidebarOpen
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-2 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isEmployeeOpen ? '0ms' : '0ms'
                    }}
                  >
                    <NavLink
                      to="/users-list"
                      className={({ isActive }) =>
                        `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                      }
                    >
                      <div className="mr-2 flex items-center justify-center flex-shrink-0">
                        <Users size={20} />
                      </div>
                      {t('users_list')}
                      {/* {t('employee_list')} */}
                    </NavLink>
                  </div>
                )}

                {/* Employee List */}
                {canAccess('employee-list') && (
                  <div
                    className={`transform transition-all duration-300 ease-in-out ${
                      isEmployeeOpen && isSidebarOpen
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-2 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isEmployeeOpen ? '0ms' : '0ms'
                    }}
                  >
                    <NavLink
                      to="/employee-list"
                      className={({ isActive }) =>
                        `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                      }
                    >
                      <div className="mr-2 flex items-center justify-center flex-shrink-0">
                        <Users size={20} />
                      </div>
                      {t('employee_list')}
                    </NavLink>
                  </div>
                )}

              </div>
            </div>
          </div>
          )}

          {/* Congé Dropdown */}
          {hasAccessToCongeRoutes() && (
            <div>
              <button
              onClick={toggleConge}
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/employee/demande-conge') || location.pathname.startsWith('/employee/liste-conge')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
              title={!isSidebarOpen ? t('conge') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Calendar size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('conge')}
              </span>
              <div className={`ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className={`transform transition-transform duration-300 ease-in-out ${isCongeOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>
            
            {/* Dropdown Items with smooth animation */}
            <div 
              className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isCongeOpen && isSidebarOpen 
                  ? 'max-h-48 opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Demande de Congé */}
                {canAccess('employee-demande-conge') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isCongeOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isCongeOpen ? '0ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/employee-demande-conge"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} />
                    </div>
                    {t('demande_de_conge')}
                  </NavLink>
                </div>
                )}

                {/* Liste de Demande de Congé */}
                {canAccess('employee-liste-conge') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isCongeOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isCongeOpen ? '50ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/employee-liste-conge"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <List size={20} />
                    </div>
                    {t('liste_demande_de_conge')}
                  </NavLink>
                </div>
                )}
              </div>
            </div>
          </div>
          )}

          {(canAccess('commandes-en-cours') || canAccess('messages')) && (
            <div className={`pt-2 pb-2 transition-normal duration-300 ${isSidebarOpen ? 'pl-2 text-sm' : 'pl-0 text-[11px]' }`}>
              <p className='font-semibold uppercase whitespace-nowrap transition-all duration-300 ease-in-out text-gray-400 dark:text-gray-500'>
                {t('en_cours')}
              </p>
            </div>
          )}
          {/* Commandes en cours */}      
          {canAccess('commandes-en-cours') && (
          <NavLink
            to="/commandes-en-cours"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
            }
            title={!isSidebarOpen ? t('commandes_en_cours') : undefined}
          >
            <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
              <BellDot size={24} />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              {t('commandes_en_cours')}
            </span>
          </NavLink>
          )}

          {/* Messages */}
          {canAccess('messages') && (
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
          )}

          {hasAccessToWebsiteRoutes() && (
            <div className={`pt-2 pb-2 transition-normal duration-300 ${isSidebarOpen ? 'pl-2 text-sm' : 'pl-0 text-[11px]' }`}>
              <p className='font-semibold uppercase whitespace-nowrap transition-all duration-300 ease-in-out text-gray-400 dark:text-gray-500'>
                {t('website')}
              </p>
            </div>
          )}

          {/* Website Dropdown */}
          {hasAccessToWebsiteRoutes() && (
            <div>
              <button
              onClick={toggleWebsite}
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/stock') || location.pathname.startsWith('/categories') || location.pathname.startsWith('/products')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
              title={!isSidebarOpen ? 'Website' : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Globe size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('website')}
              </span>
              <div className={`ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className={`transform transition-transform duration-300 ease-in-out ${isWebsiteOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>
            
            {/* Dropdown Items with smooth animation */}
            <div 
              className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isWebsiteOpen && isSidebarOpen 
                  ? 'max-h-56 opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Stock */}
                {/* <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isWebsiteOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isWebsiteOpen ? '0ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/stock"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Boxes size={20} />
                    </div>
                    Stock
                  </NavLink>
                </div> */}

                {/* Categories */}
                {canAccess('categories') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isWebsiteOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isWebsiteOpen ? '50ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/categories"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Tag size={20} />
                    </div>
                    Categories
                  </NavLink>
                </div>
                )}

                {/* Products */}
                {canAccess('products') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isWebsiteOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isWebsiteOpen ? '100ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/products"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Package size={20} />
                    </div>
                    Products
                  </NavLink>
                </div>
                )}
                
                
                {/* HomePage Carousel */}
                {canAccess('carousel') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isWebsiteOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isWebsiteOpen ? '100ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/carousel"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <GalleryHorizontal size={20} />
                    </div>
                    Carousel
                  </NavLink>
                </div>
                )}

                {/* HomePage Carousel */}
                {canAccess('qr-code') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isWebsiteOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isWebsiteOpen ? '100ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/qr-code"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <QrCode size={20} />
                    </div>
                    QrCode
                  </NavLink>
                </div>
                )}
              </div>
            </div>
          </div>
          )}
          {canAccess('caisse') && (
            <div className={`pt-2 pb-2 transition-normal duration-300 ${isSidebarOpen ? 'pl-2 text-sm' : 'pl-0 text-[11px]' }`}>
              <p className='font-semibold uppercase whitespace-nowrap transition-all duration-300 ease-in-out text-gray-400 dark:text-gray-500'>
                {t('caisse')}
              </p>
            </div>
          )}
          {/* Caisse - Admin Only */}
          {canAccess('caisse') && (
            <NavLink
              to="/caisse"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
              }
              title={!isSidebarOpen ? t('caisse') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Wallet size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('caisse')}
              </span>
            </NavLink>
          )}

          {/* Assistant IA - Admin Only */}
          {canAccess('assistant') && (
            <NavLink
              to="/assistant"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md ${isActive ? 'border-blue-600 pl-2 border-l-4 bg-blue-100 dark:bg-gray-900 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
              }
              title={!isSidebarOpen ? t('assistant_ia') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Brain size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                Assistant IA
              </span>
            </NavLink>
          )}

        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;