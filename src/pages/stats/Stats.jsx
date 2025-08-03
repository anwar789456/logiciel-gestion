import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  MessageSquare, 
  Users, 
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';

import ModernStatsCard from '../../components/ModernStatsCard';
import DataTable from '../../components/DataTable';
import { 
  getGeneralStats, 
  getProductsData, 
  getCommandesData, 
  getDevisData, 
  getMessagesData,
  getChartsData,
  getAvailableClients
} from '../../api/stats';
import { ModernPieChart, ModernBarChart, ModernLineChart, ModernMultiBarChart } from '../../components/ModernCharts';
import AdvancedFilters from '../../components/AdvancedFilters';

function Stats() {
  const { t } = useTranslation();
  const [generalStats, setGeneralStats] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [availableClients, setAvailableClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadGeneralStats();
    loadChartsData();
    loadAvailableClients();
  }, []);

  const loadGeneralStats = async () => {
    try {
      setLoading(true);
      const stats = await getGeneralStats();
      setGeneralStats(stats);
    } catch (error) {
      console.error('Error loading general stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartsData = async () => {
    try {
      const charts = await getChartsData();
      setChartsData(charts);
    } catch (error) {
      console.error('Error loading charts data:', error);
    }
  };

  const loadAvailableClients = async () => {
    try {
      const clients = await getAvailableClients();
      setAvailableClients(clients);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Ici vous pouvez ajouter la logique pour filtrer les données
    console.log('Filters changed:', newFilters);
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'charts', label: 'Graphiques', icon: PieChart },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'commandes', label: 'Commandes', icon: ShoppingCart },
    { id: 'devis', label: 'Devis', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare }
  ];

  const productColumns = [
    { key: 'nom', header: 'Nom', type: 'text' },
    { key: 'categorie', header: 'Catégorie', type: 'text' },
    { key: 'quantite', header: 'Quantité', type: 'text' },
    { key: 'minPrice', header: 'Prix Min', type: 'price' },
    { key: 'maxPrice', header: 'Prix Max', type: 'price' },
    { key: 'disponibilite', header: 'Statut', type: 'status' },
    { key: 'createdAt', header: 'Créé le', type: 'date' }
  ];

  const commandeColumns = [
    { key: 'nomPrenom', header: 'Client', type: 'text' },
    { key: 'email', header: 'Email', type: 'email' },
    { key: 'telephone', header: 'Téléphone', type: 'phone' },
    { key: 'gouvernorat', header: 'Gouvernorat', type: 'text' },
    { key: 'createdAt', header: 'Date', type: 'date' }
  ];

  const devisColumns = [
    { key: 'nomPrenom', header: 'Client', type: 'text' },
    { key: 'email', header: 'Email', type: 'email' },
    { key: 'telephone', header: 'Téléphone', type: 'phone' },
    { key: 'gouvernorat', header: 'Gouvernorat', type: 'text' },
    { key: 'createdAt', header: 'Date', type: 'date' }
  ];

  const messageColumns = [
    { key: 'nom', header: 'Nom', type: 'text' },
    { key: 'email', header: 'Email', type: 'email' },
    { key: 'message', header: 'Message', type: 'text' },
    { key: 'createdAt', header: 'Date', type: 'datetime' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Total Produits"
          value={generalStats?.products?.total || 0}
          subtitle={`${generalStats?.products?.available || 0} disponibles`}
          icon={Package}
          color="blue"
          loading={loading}
          trend={12}
          timeframe="Dernière mise à jour"
        />
        <ModernStatsCard
          title="Commandes"
          value={generalStats?.commandes?.total || 0}
          subtitle={`${generalStats?.commandes?.pending || 0} en attente`}
          icon={ShoppingCart}
          color="green"
          loading={loading}
          trend={8}
          timeframe="Ce mois"
        />
        <ModernStatsCard
          title="Devis"
          value={generalStats?.devis?.total || 0}
          subtitle={`${generalStats?.devis?.recent || 0} ce mois`}
          icon={FileText}
          color="yellow"
          loading={loading}
          trend={-3}
          timeframe="30 derniers jours"
        />
        <ModernStatsCard
          title="Messages"
          value={generalStats?.messages?.total || 0}
          subtitle={`${generalStats?.messages?.unread || 0} non lus`}
          icon={MessageSquare}
          color="purple"
          loading={loading}
          trend={15}
          timeframe="Cette semaine"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Répartition des Produits
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Disponibles</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{generalStats?.products?.available || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Indisponibles</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  {(generalStats?.products?.total || 0) - (generalStats?.products?.available || 0)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Catégories</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">{generalStats?.products?.categories || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activité Récente
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Commandes totales</span>
              <span className="text-sm font-medium">{generalStats?.commandes?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Devis récents</span>
              <span className="text-sm font-medium">{generalStats?.devis?.recent || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Messages non lus</span>
              <span className="text-sm font-medium">{generalStats?.messages?.unread || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCharts = () => {
    if (!chartsData) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filtres avancés */}
        <AdvancedFilters 
          onFiltersChange={handleFiltersChange}
          availableClients={availableClients}
          loading={loading}
        />

        {/* Graphiques en camembert */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernPieChart
            data={chartsData.productsByCategory || []}
            title="Répartition des Produits par Catégorie"
            subtitle="Analyse par catégorie de produits"
            dataKey="value"
            nameKey="name"
          />
          <ModernPieChart
            data={chartsData.productsByAvailability || []}
            title="Disponibilité des Produits"
            subtitle="Statut de disponibilité en temps réel"
            dataKey="value"
            nameKey="name"
          />
        </div>

        {/* Histogrammes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernBarChart
            data={chartsData.commandesByMonth || []}
            title="Commandes par Mois"
            subtitle="Évolution mensuelle des commandes"
            xKey="name"
            yKey="value"
            color="#10B981"
          />
          <ModernBarChart
            data={chartsData.devisByMonth || []}
            title="Devis par Mois"
            subtitle="Tendance des demandes de devis"
            xKey="name"
            yKey="value"
            color="#F59E0B"
          />
        </div>

        {/* Graphiques en ligne */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernLineChart
            data={chartsData.messagesByDay || []}
            title="Messages par Jour"
            subtitle="Activité des 7 derniers jours"
            xKey="name"
            yKey="value"
            color="#8B5CF6"
          />
          <ModernLineChart
            data={chartsData.commandesByMonth || []}
            title="Tendance des Commandes"
            subtitle="Croissance mensuelle"
            xKey="name"
            yKey="value"
            color="#3B82F6"
          />
        </div>

        {/* Graphique multi-barres */}
        <div className="w-full">
          <ModernMultiBarChart
            data={[
              { name: 'Jan', commandes: 12, devis: 8, messages: 25 },
              { name: 'Fév', commandes: 19, devis: 12, messages: 30 },
              { name: 'Mar', commandes: 15, devis: 10, messages: 22 },
              { name: 'Avr', commandes: 22, devis: 15, messages: 35 },
              { name: 'Mai', commandes: 18, devis: 11, messages: 28 },
              { name: 'Juin', commandes: 25, devis: 18, messages: 40 }
            ]}
            title="Comparaison Mensuelle des Activités"
            subtitle="Vue d'ensemble des performances"
            bars={[
              { dataKey: 'commandes', name: 'Commandes', color: '#10B981' },
              { dataKey: 'devis', name: 'Devis', color: '#F59E0B' },
              { dataKey: 'messages', name: 'Messages', color: '#8B5CF6' }
            ]}
          />
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'charts':
        return renderCharts();
      case 'products':
        return (
          <DataTable
            title="Liste des Produits"
            columns={productColumns}
            fetchData={getProductsData}
            searchPlaceholder="Rechercher un produit..."
          />
        );
      case 'commandes':
        return (
          <DataTable
            title="Liste des Commandes"
            columns={commandeColumns}
            fetchData={getCommandesData}
            searchPlaceholder="Rechercher une commande..."
          />
        );
      case 'devis':
        return (
          <DataTable
            title="Liste des Devis"
            columns={devisColumns}
            fetchData={getDevisData}
            searchPlaceholder="Rechercher un devis..."
          />
        );
      case 'messages':
        return (
          <DataTable
            title="Liste des Messages"
            columns={messageColumns}
            fetchData={getMessagesData}
            searchPlaceholder="Rechercher un message..."
          />
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="pt-4 px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Statistiques et Données
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tableau de bord interactif avec toutes vos données
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              loadGeneralStats();
              loadChartsData();
              loadAvailableClients();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default Stats;