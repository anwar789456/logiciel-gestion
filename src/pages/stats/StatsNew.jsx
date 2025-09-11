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
  PieChart,
  Receipt,
  Truck,
  CreditCard,
  DollarSign,
  Calendar,
  RefreshCw,
  Activity
} from 'lucide-react';

import ModernStatsCard from '../../components/ModernStatsCard';
import { 
  getGeneralStats, 
  getFinancialStats, 
  getChartsData, 
  getAvailableClients 
} from '../../api/stats';
import { ModernPieChart, ModernBarChart, ModernLineChart, ModernMultiBarChart } from '../../components/ModernCharts';

function Stats() {
  const { t } = useTranslation();
  const [generalStats, setGeneralStats] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [financialStats, setFinancialStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [stats, financial, charts] = await Promise.all([
        getGeneralStats(),
        getFinancialStats(),
        getChartsData()
      ]);
      
      setGeneralStats(stats);
      setFinancialStats(financial);
      setChartsData(charts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'charts', label: 'Graphiques', icon: PieChart }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Stats Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-blue-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tableau de Bord Exécutif
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Vue d'ensemble des performances de votre entreprise
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {financialStats?.totalRevenue || 0} DT
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Chiffre d'affaires total</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                +8%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {generalStats?.commandes?.total || 0}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Commandes totales</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {generalStats?.products?.available || 0} actifs
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {generalStats?.products?.total || 0}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Produits en catalogue</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-3">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Actif
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {generalStats?.messages?.total || 0}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Messages clients</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModernStatsCard
          title="Factures"
          value={financialStats?.factures?.total || 0}
          subtitle={`${financialStats?.factures?.paid || 0} payées`}
          icon={Receipt}
          color="emerald"
          loading={loading}
          trend={5}
          timeframe="Ce mois"
        />
        <ModernStatsCard
          title="Bons de Livraison"
          value={financialStats?.bonLivraison?.total || 0}
          subtitle={`${financialStats?.bonLivraison?.delivered || 0} livrés`}
          icon={Truck}
          color="orange"
          loading={loading}
          trend={7}
          timeframe="Cette semaine"
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
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Indicateurs de Performance
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Taux de conversion</span>
              <span className="text-xl font-bold text-green-600">{financialStats?.conversionRate?.devisToFacture || 0}%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Taux de livraison</span>
              <span className="text-xl font-bold text-blue-600">{financialStats?.conversionRate?.deliveryRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Délai moyen paiement</span>
              <span className="text-xl font-bold text-orange-600">{financialStats?.averagePaymentDelay || 0} jours</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <PieChart className="h-6 w-6 text-purple-600" />
              Répartition des Activités
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Produits disponibles</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {generalStats?.products?.available || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Commandes en attente</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {generalStats?.commandes?.pending || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Messages non lus</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {generalStats?.messages?.unread || 0}
              </span>
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
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
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
      <div className="space-y-8">
        {/* Charts Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Analyse Graphique</h2>
              <p className="text-indigo-100">Visualisation avancée de vos données métier</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <BarChart3 className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Pie Charts Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <PieChart className="h-7 w-7 text-blue-600" />
            Graphiques Circulaires
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Répartition des Produits</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Par catégorie de produits</p>
              </div>
              <div className="p-6">
                <ModernPieChart
                  data={chartsData.productsByCategory || [
                    { name: 'Électronique', value: 45 },
                    { name: 'Vêtements', value: 30 },
                    { name: 'Maison', value: 25 }
                  ]}
                  dataKey="value"
                  nameKey="name"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Statut des Commandes</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Répartition par statut</p>
              </div>
              <div className="p-6">
                <ModernPieChart
                  data={chartsData.ordersByStatus || [
                    { name: 'Confirmées', value: 60 },
                    { name: 'En attente', value: 25 },
                    { name: 'Annulées', value: 15 }
                  ]}
                  dataKey="value"
                  nameKey="name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bar Charts Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-green-600" />
            Histogrammes
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Commandes Mensuelles</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Évolution sur 6 mois</p>
              </div>
              <div className="p-6">
                <ModernBarChart
                  data={chartsData.commandesByMonth || [
                    { name: 'Jan', value: 12 },
                    { name: 'Fév', value: 19 },
                    { name: 'Mar', value: 15 },
                    { name: 'Avr', value: 22 },
                    { name: 'Mai', value: 18 },
                    { name: 'Juin', value: 25 }
                  ]}
                  xKey="name"
                  yKey="value"
                  color="#10B981"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Revenus Mensuels</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Chiffre d'affaires par mois</p>
              </div>
              <div className="p-6">
                <ModernBarChart
                  data={chartsData.revenueByMonth || [
                    { name: 'Jan', value: 1200 },
                    { name: 'Fév', value: 1900 },
                    { name: 'Mar', value: 1500 },
                    { name: 'Avr', value: 2200 },
                    { name: 'Mai', value: 1800 },
                    { name: 'Juin', value: 2500 }
                  ]}
                  xKey="name"
                  yKey="value"
                  color="#F59E0B"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Charts Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-purple-600" />
            Courbes de Tendance
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Messages Quotidiens</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Activité des 7 derniers jours</p>
              </div>
              <div className="p-6">
                <ModernLineChart
                  data={chartsData.messagesByDay || [
                    { name: 'Lun', value: 8 },
                    { name: 'Mar', value: 12 },
                    { name: 'Mer', value: 6 },
                    { name: 'Jeu', value: 15 },
                    { name: 'Ven', value: 10 },
                    { name: 'Sam', value: 4 },
                    { name: 'Dim', value: 7 }
                  ]}
                  xKey="name"
                  yKey="value"
                  color="#8B5CF6"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Croissance des Ventes</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Tendance sur 6 mois</p>
              </div>
              <div className="p-6">
                <ModernLineChart
                  data={chartsData.salesGrowth || [
                    { name: 'Jan', value: 100 },
                    { name: 'Fév', value: 120 },
                    { name: 'Mar', value: 115 },
                    { name: 'Avr', value: 140 },
                    { name: 'Mai', value: 135 },
                    { name: 'Juin', value: 160 }
                  ]}
                  xKey="name"
                  yKey="value"
                  color="#3B82F6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Bar Chart Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            Analyse Comparative
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Mensuelle Comparative</h4>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Commandes, Devis et Messages par mois</p>
            </div>
            <div className="p-6">
              <ModernMultiBarChart
                data={[
                  { name: 'Jan', commandes: 12, devis: 8, messages: 25 },
                  { name: 'Fév', commandes: 19, devis: 12, messages: 30 },
                  { name: 'Mar', commandes: 15, devis: 10, messages: 22 },
                  { name: 'Avr', commandes: 22, devis: 15, messages: 35 },
                  { name: 'Mai', commandes: 18, devis: 11, messages: 28 },
                  { name: 'Juin', commandes: 25, devis: 18, messages: 40 }
                ]}
                bars={[
                  { dataKey: 'commandes', name: 'Commandes', color: '#10B981' },
                  { dataKey: 'devis', name: 'Devis', color: '#F59E0B' },
                  { dataKey: 'messages', name: 'Messages', color: '#8B5CF6' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'charts':
        return renderCharts();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-4 px-8 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Tableau de Bord Analytique
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Analyse complète des performances et tendances de votre entreprise
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Actualiser les données
            </button>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
          <nav className="flex space-x-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="pb-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Stats;
