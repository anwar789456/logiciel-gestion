import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { Receipt, ListOrdered, LayoutGrid, MessageCircleMore, Tags, List, CalendarDays, QrCode, GalleryHorizontal, TicketCheck, ScrollText, ChevronDown, Clipboard, BellDot, FileText, ChevronsRight, ChevronsLeft, TrendingUp, Brain, Truck, Users, TrendingDown, UserCheck, Calendar, Wallet, Globe, Tag, Package, LogOut, Megaphone, DollarSign, CreditCard, ShoppingCart, PackageCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';

function Sidebar() {
  const { t } = useTranslation();
  const { isSidebarOpen, toggleSidebar } = useApp();
  const { canAccess } = useAuth();
  const location = useLocation();
  const [isVentesOpen, setIsVentesOpen] = useState(false);
  const [isAchatsOpen, setIsAchatsOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [isWebsiteOpen, setIsWebsiteOpen] = useState(false);
  const [isRHOpen, setIsRHOpen] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  
  const hasAccessToVentesRoutes = () => {
    const routes = ['devis', 'factures', 'bon-de-livraison', 'recue-de-paiement-sur-commande', 'commandes-fiche', 'bon-de-sortie', 'crm', 'fiche-commande'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToAchatsRoutes = () => {
    const routes = ['fournisseur', 'bon-commande-fournisseur', 'bon-reception'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToEmployeeRoutes = () => {
    const routes = ['users', 'employes'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToRHRoutes = () => {
    const routes = ['users', 'employes', 'employee-demande-conge', 'employee-liste-conge', 'conge'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToProductionRoutes = () => {
    const routes = ['encours-de-production', 'etat-par-artisan', 'fiche-production-artisan'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToFinanceRoutes = () => {
    const routes = ['caisse', 'bordereau-cheques', 'bordereau-cheques-recu', 'bordereau-traites', 'bordereau-traites-recu', 'echeancier-cheques', 'echeancier-cheques-recus'];
    return routes.some(route => canAccess(route));
  };
  
  const hasAccessToWebsiteRoutes = () => {
    const routes = ['stock', 'categories', 'products', 'tags', 'carousel', 'qr-code', 'commandes-client', 'messages', 'advertisement'];
    return routes.some(route => canAccess(route));
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

  const toggleRH = () => {
    setIsRHOpen(!isRHOpen);
  };

  const toggleProduction = () => {
    setIsProductionOpen(!isProductionOpen);
  };

  const toggleFinance = () => {
    setIsFinanceOpen(!isFinanceOpen);
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
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/devis') || location.pathname.startsWith('/factures') || location.pathname.startsWith('/bon-livraison') || location.pathname.startsWith('/commandes-fiche') || location.pathname.startsWith('/recue-de-paiement-sur-commande') || location.pathname.startsWith('/bon-de-sortie') || location.pathname.startsWith('/crm') || location.pathname.startsWith('/fiche-commande')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
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
                  ? 'max-h-96 opacity-100 mt-1' 
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

                {canAccess('commandes-fiche') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isVentesOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isVentesOpen ? '200ms' : '0ms'
                  }}
                >
                  <NavLink
                      to="/fiche-commande"
                      className={({ isActive }) =>
                        `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                      }
                    >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    Fiche Commandes 
                  </NavLink>
                </div>
                )}

                {/* Bon de Sortie */}
                {canAccess('bon-de-sortie') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isVentesOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isVentesOpen ? '250ms' : '0ms'
                  }}
                >
                  <NavLink
                      to="/bon-de-sortie"
                      className={({ isActive }) =>
                        `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                      }
                    >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <LogOut size={20} />
                    </div>
                    {t('bon_de_sortie')}
                  </NavLink>
                </div>
                )}

                {/* CRM */}
                {canAccess('crm') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isVentesOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isVentesOpen ? '300ms' : '0ms'
                  }}
                >
                  <NavLink
                      to="/crm"
                      className={({ isActive }) =>
                        `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                      }
                    >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Users size={20} />
                    </div>
                    Groupage
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
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/fournisseur') || location.pathname.startsWith('/bon-commande-fournisseur') || location.pathname.startsWith('/bon-reception')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
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
                  ? 'max-h-48 opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Bon de Commande Fournisseur */}
                {canAccess('bon-commande-fournisseur') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isAchatsOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isAchatsOpen ? '50ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/bon-commande-fournisseur"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart size={20} />
                    </div>
                    Bon de Commande Fournisseur
                  </NavLink>
                </div>
                )}

                {/* Bon de Réception */}
                {canAccess('bon-reception') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isAchatsOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isAchatsOpen ? '100ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/bon-reception"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <PackageCheck size={20} />
                    </div>
                    Bon de Réception
                  </NavLink>
                </div>
                )}

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

          {/* Production Dropdown */}
          {hasAccessToProductionRoutes() && (
            <div>
              <button
              onClick={toggleProduction}
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/encours-de-production') || location.pathname.startsWith('/etat-par-artisan') || location.pathname.startsWith('/fiche-production-artisan')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
              title={!isSidebarOpen ? t('production') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Package size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('production')}
              </span>
              <div className={`ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className={`transform transition-transform duration-300 ease-in-out ${isProductionOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>
            
            {/* Dropdown Items with smooth animation */}
            <div 
              className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isProductionOpen && isSidebarOpen 
                  ? 'max-h-96 opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Encours De Production */}
                {canAccess('encours-de-production') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isProductionOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isProductionOpen ? '0ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/encours-de-production"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Clipboard size={20} />
                    </div>
                    {t('encours_de_production')}
                  </NavLink>
                </div>
                )}

                {/* Etat Par Artisan */}
                {canAccess('etat-par-artisan') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isProductionOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isProductionOpen ? '50ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/etat-par-artisan"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Users size={20} />
                    </div>
                    {t('etat_par_artisan')}
                  </NavLink>
                </div>
                )}

                {/* Fiche de Production Par Artisan */}
                {canAccess('fiche-production-artisan') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isProductionOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isProductionOpen ? '100ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/fiche-production-artisan"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    {t('fiche_production_artisan')}
                  </NavLink>
                </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Finance Dropdown */}
          {hasAccessToFinanceRoutes() && (
            <div>
              <button
              onClick={toggleFinance}
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/caisse') || location.pathname.startsWith('/bordereau-cheques') || location.pathname.startsWith('/bordereau-traites') || location.pathname.startsWith('/echeancier-cheques')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
              title={!isSidebarOpen ? t('finance') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <DollarSign size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('finance')}
              </span>
              <div className={`ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className={`transform transition-transform duration-300 ease-in-out ${isFinanceOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>
            
            {/* Dropdown Items with smooth animation */}
            <div 
              className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isFinanceOpen && isSidebarOpen 
                  ? 'max-h-[600px] opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Bordereau de Caisse */}
                {canAccess('caisse') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isFinanceOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isFinanceOpen ? '0ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/caisse"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Wallet size={20} />
                    </div>
                    {t('bordereau_de_caisse')}
                  </NavLink>
                </div>
                )}

                {/* Bordereau de Chèques Emis */}
                {canAccess('bordereau-cheques') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isFinanceOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isFinanceOpen ? '50ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/bordereau-cheques"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <CreditCard size={20} />
                    </div>
                    Bord de Chèques Emis
                  </NavLink>
                </div>
                )}

                {/* Bordereau de Chèques Reçus */}
                {canAccess('bordereau-cheques-recu') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isFinanceOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isFinanceOpen ? '75ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/bordereau-cheques-recu"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <CreditCard size={20} />
                    </div>
                    Bord de Chèques Reçus
                  </NavLink>
                </div>
                )}

                {/* Bordereau de Traites Emis */}
                {canAccess('bordereau-traites') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isFinanceOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isFinanceOpen ? '100ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/bordereau-traites"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    Bord de Traites Emis
                  </NavLink>
                </div>
                )}

                {/* Bordereau de Traites Reçus */}
                {canAccess('bordereau-traites-recu') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isFinanceOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isFinanceOpen ? '125ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/bordereau-traites-recu"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    Bord de Traites Reçus
                  </NavLink>
                </div>
                )}

                {/* Échéancier Chèques Émis */}
                {canAccess('echeancier-cheques') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isFinanceOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isFinanceOpen ? '150ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/echeancier-cheques-emis"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} />
                    </div>
                    Ech de Cheques Emis
                  </NavLink>
                </div>
                )}

                {/* Échéancier Chèques Reçus */}
                {canAccess('echeancier-cheques-recus') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isFinanceOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isFinanceOpen ? '175ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/echeancier-cheques-recus"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} />
                    </div>
                    Ech de Cheques Recus
                  </NavLink>
                </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* RH Dropdown */}
          {hasAccessToRHRoutes() && (
            <div>
              <button
              onClick={toggleRH}
              className={`cursor-pointer w-full flex items-center p-3 rounded-s-xs transition-colors duration-300 rounded-r-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${(location.pathname.startsWith('/users') || location.pathname.startsWith('/employes') || location.pathname.startsWith('/employee') || location.pathname.startsWith('/conge')) ? 'pl-2 text-blue-600 dark:text-blue-50' : ''}`}
              title={!isSidebarOpen ? t('rh') : undefined}
            >
              <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                <UserCheck size={24} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                {t('rh')}
              </span>
              <div className={`ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className={`transform transition-transform duration-300 ease-in-out ${isRHOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>
            
            {/* Dropdown Items with smooth animation */}
            <div 
              className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isRHOpen && isSidebarOpen 
                  ? 'max-h-[600px] opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* User List */}
                {canAccess('users') && (
                  <div
                    className={`transform transition-all duration-300 ease-in-out ${
                      isRHOpen && isSidebarOpen
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-2 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isRHOpen ? '0ms' : '0ms'
                    }}
                  >
                    <NavLink
                      to="/users"
                      className={({ isActive }) =>
                        `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                      }
                    >
                      <div className="mr-2 flex items-center justify-center flex-shrink-0">
                        <Users size={20} />
                      </div>
                      {t('users_list')}
                    </NavLink>
                  </div>
                )}

                {/* Employee List */}
                {canAccess('employes') && (
                  <div
                    className={`transform transition-all duration-300 ease-in-out ${
                      isRHOpen && isSidebarOpen
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-2 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isRHOpen ? '50ms' : '0ms'
                    }}
                  >
                    <NavLink
                      to="/employes"
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

                {/* Demande de Congé */}
                {canAccess('employee-demande-conge') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isRHOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isRHOpen ? '100ms' : '0ms'
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
                    isRHOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isRHOpen ? '150ms' : '0ms'
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

                {/* Congé */}
                {canAccess('conge') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isRHOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isRHOpen ? '200ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/conge"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} />
                    </div>
                    {t('liste_conge')}
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
                  ? 'max-h-[600px] opacity-100 mt-1' 
                  : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="space-y-1 transform transition-transform duration-300 ease-in-out">
                {/* Tags */}
                <div
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
                    to="/tags"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Tags size={20} />
                    </div>
                    Tags
                  </NavLink>
                </div>

                {/* Order */}
                <div
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
                    to="/productsordering"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <ListOrdered size={20} />
                    </div>
                    {t('product_ordering')}
                  </NavLink>
                </div>

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
                    {t('products')}
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
                
                {/* Commandes Client */}
                {canAccess('commandes-client') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isWebsiteOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isWebsiteOpen ? '150ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/commandes-client"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Clipboard size={20} />
                    </div>
                    {t('commandes_en_cours')}
                  </NavLink>
                </div>
                )}
                
                {/* Messagerie */}
                {canAccess('messages') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isWebsiteOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isWebsiteOpen ? '200ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/messages"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <MessageCircleMore size={20} />
                    </div>
                    {t('messages')}
                  </NavLink>
                </div>
                )}
                
                {/* Advertisement */}
                {canAccess('advertisement') && (
                <div
                  className={`transform transition-all duration-300 ease-in-out ${
                    isWebsiteOpen && isSidebarOpen
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isWebsiteOpen ? '250ms' : '0ms'
                  }}
                >
                  <NavLink
                    to="/advertisement"
                    className={({ isActive }) =>
                      `font-medium flex items-center p-2 pl-4 rounded-r-md text-md transition-all duration-350 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'}`
                    }
                  >
                    <div className="mr-2 flex items-center justify-center flex-shrink-0">
                      <Megaphone size={20} />
                    </div>
                    {t('advertisement')}
                  </NavLink>
                </div>
                )}
              </div>
            </div>
          </div>
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