import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  MapPin, 
  Target, 
  BarChart3, 
  Lightbulb,
  RefreshCw,
  Star,
  AlertCircle,
  CheckCircle,
  Activity,
  Zap,
  Eye,
  Award,
  Sparkles,
  Rocket,
  Shield,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Cpu,
  Database,
  LineChart,
  PieChart,
  BarChart,
  Calendar,
  Clock,
  Gauge,
  Flame,
  Crown,
  Diamond,
  Gift,
  User,
  Trophy,
  MessageCircle
} from 'lucide-react';
import { getAIInsights } from '../../api/aiAssistant';
import AIAssistantChat from './AIAssistantChat';

const SUGGESTIONS = [
  "Quel est le produit le plus vendu ce mois-ci ?",
  "Quels sont les clients à relancer ?",
  "Prévision de chiffre d'affaires pour le trimestre ?",
  "Quels produits sont en rupture de stock ?",
  "Quelle région a le plus progressé ?"
];

function ConseilDuJour({ conseil }) {
  return (
    <div className="bg-gradient-to-r from-yellow-100 to-yellow-300 rounded-2xl shadow-lg p-6 flex items-center gap-4 mb-6 animate-fade-in">
      <Gift className="w-10 h-10 text-yellow-500 animate-bounce" />
      <div>
        <div className="text-lg font-bold text-yellow-800 mb-1">Conseil IA du jour</div>
        <div className="text-gray-800 text-md">{conseil}</div>
      </div>
    </div>
  );
}

function ObjectifCA({ actuel, objectif }) {
  const percent = Math.min(100, Math.round((actuel / objectif) * 100));
  return (
    <div className="bg-gradient-to-r from-blue-100 to-blue-300 rounded-2xl shadow-lg p-6 flex flex-col gap-2 mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-6 h-6 text-blue-500" />
        <span className="font-bold text-blue-900">Objectif du mois</span>
        <span className="ml-auto text-blue-700 font-bold">{actuel.toLocaleString()} / {objectif.toLocaleString()} DT</span>
      </div>
      <div className="w-full h-4 bg-blue-200 rounded-full overflow-hidden">
        <div className="h-4 bg-blue-500" style={{ width: `${percent}%`, transition: 'width 1s' }}></div>
      </div>
      <div className="text-right text-sm text-blue-700 font-semibold">{percent}% atteint</div>
    </div>
  );
}

function ClassementClients({ clients }) {
  return (
    <div className="bg-gradient-to-r from-green-100 to-green-300 rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-green-600" />
        <span className="font-bold text-green-900">Top 3 Clients du Mois</span>
      </div>
      <div className="flex flex-col gap-3">
        {clients.slice(0, 3).map((client, idx) => (
          <div key={client.name} className="flex items-center gap-3">
            <User className="w-7 h-7 text-green-700 bg-white rounded-full p-1 shadow" />
            <span className="font-bold text-green-900">{client.name}</span>
            <span className="text-gray-700">{client.ca.toLocaleString()} DT</span>
            <span className="text-gray-500 text-xs">{client.orders} commandes</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold shadow ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-300 text-gray-800' : 'bg-orange-300 text-white'}`}>{idx === 0 ? 'VIP' : idx === 1 ? 'Gold' : 'Silver'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const AssistantIA = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  // Conseil IA du jour (aléatoire)
  const conseils = [
    "Essayez de mettre en avant le produit best-seller en vitrine cette semaine !",
    "Relancez les clients VIP pour booster vos ventes.",
    "Analysez les régions en croissance pour cibler vos promos.",
    "Optimisez le stock des produits tendance.",
    "Faites une offre spéciale sur les produits en baisse."
  ];
  const conseilJour = conseils[new Date().getDate() % conseils.length];
  // Objectif CA (exemple)
  const objectifCA = 100000;
  const caActuel = insights?.salesPerformance?.currentMonth?.revenue || 0;
  // Classement clients (mock si pas dans insights)
  const topClients = insights?.clientAnalysis?.topClients || [
    { name: 'Mme Ben Ali', ca: 12000, orders: 8 },
    { name: 'M. Trabelsi', ca: 9500, orders: 6 },
    { name: 'Mme Gharbi', ca: 8700, orders: 7 }
  ];

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAIInsights();
      setInsights(data);
    } catch (err) {
      setError('Erreur lors du chargement des analyses IA');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <Brain className="w-16 h-16 text-cyan-400 animate-pulse mx-auto mb-6" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Cpu className="w-6 h-6 text-green-400 animate-spin" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">🤖 IA en action</h3>
                <p className="text-lg text-cyan-200 mb-2">Analyse des données en cours...</p>
                <p className="text-sm text-blue-200">L'intelligence artificielle traite vos données business</p>
                <div className="mt-4 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur d'analyse</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadInsights}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'chat', label: 'Assistant IA (Chat)', icon: Brain },
    { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
    { id: 'products', label: 'Produits', icon: BarChart3 },
    { id: 'regions', label: 'Régions', icon: MapPin },
    { id: 'predictions', label: 'Prédictions', icon: Target },
    { id: 'performance', label: 'Performance', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Conseil IA du jour */}
        <ConseilDuJour conseil={conseilJour} />
        {/* Objectif CA */}
        <ObjectifCA actuel={caActuel} objectif={objectifCA} />
        {/* Classement clients */}
        <ClassementClients clients={topClients} />
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Assistant IA</h1>
                <p className="text-gray-600 mt-1">Analyses intelligentes et prédictions business</p>
              </div>
            </div>
            <button
              onClick={loadInsights}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'chat' && <AIAssistantChat suggestions={SUGGESTIONS} />}
        {activeTab === 'overview' && <OverviewTab insights={insights} />}
        {activeTab === 'products' && <ProductsTab insights={insights} />}
        {activeTab === 'regions' && <RegionsTab insights={insights} />}
        {activeTab === 'predictions' && <PredictionsTab insights={insights} />}
        {activeTab === 'performance' && <PerformanceTab insights={insights} />}
      </div>
    </div>
  );
};

// Composant Vue d'ensemble
const OverviewTab = ({ insights }) => {
  // Extraction du top produit (par quantité)
  const topProduct = insights?.topProducts?.topByQuantity?.[0];
  // Extraction de la top région (par CA)
  const topRegion = (insights?.regionAnalysis || []).reduce((max, region) => {
    if (!max || (region.totalRevenue || 0) > (max.totalRevenue || 0)) return region;
    return max;
  }, null);

  const stats = [
    {
      title: 'Produits analysés',
      value: insights?.topProducts?.topByQuantity?.length || 0,
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: 'Régions actives',
      value: insights?.regionAnalysis?.length || 0,
      icon: MapPin,
      color: 'green'
    },
    {
      title: 'Croissance CA',
      value: `${insights?.salesPerformance?.growth?.revenue?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Commandes ce mois',
      value: insights?.salesPerformance?.currentMonth?.orders || 0,
      icon: Activity,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Champions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Produit */}
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-2xl shadow-2xl p-8 flex items-center gap-6 animate-fade-in">
          <div className="flex-shrink-0">
            <Crown className="w-14 h-14 text-yellow-500 drop-shadow-lg animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-yellow-400 text-white px-3 py-1 rounded-full font-bold text-sm shadow">#1 Produit</span>
              <span className="text-lg font-semibold text-yellow-700">{topProduct?.name || 'Aucun'}</span>
            </div>
            <div className="text-gray-700 text-md font-medium">Quantité vendue : <span className="text-2xl font-bold text-yellow-800">{topProduct?.totalQuantity || 0}</span></div>
            <div className="text-gray-500 text-sm mt-1">Commandes : {topProduct?.orders || 0}</div>
          </div>
        </div>
        {/* Top Région */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-2xl shadow-2xl p-8 flex items-center gap-6 animate-fade-in">
          <div className="flex-shrink-0">
            <MapPin className="w-14 h-14 text-blue-500 drop-shadow-lg animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-400 text-white px-3 py-1 rounded-full font-bold text-sm shadow">Top Région</span>
              <span className="text-lg font-semibold text-blue-700">{topRegion?.region || 'Aucune'}</span>
            </div>
            <div className="text-gray-700 text-md font-medium">CA : <span className="text-2xl font-bold text-blue-800">{topRegion?.totalRevenue?.toFixed(0) || 0} DT</span></div>
            <div className="text-gray-500 text-sm mt-1">Commandes : {topRegion?.totalOrders || 0} | Clients : {topRegion?.clientCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-80">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`bg-${stat.color}-100 p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Findings */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Lightbulb className="w-6 h-6 text-yellow-500 mr-3" />
          Insights Clés
        </h3>
        <div className="space-y-4">
          {insights?.summary?.keyFindings?.map((finding, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">{finding}</p>
            </div>
          )) || (
            <p className="text-gray-500 italic">Aucun insight disponible pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant Produits
const ProductsTab = ({ insights }) => {
  // Podium top 3 par quantité
  const topByQuantity = insights?.topProducts?.topByQuantity || [];
  const podium = topByQuantity.slice(0, 3);
  const others = topByQuantity.slice(3, 8);
  // Top par revenus
  const topByRevenue = insights?.topProducts?.topByRevenue || [];

  const podiumColors = [
    'from-yellow-300 to-yellow-500', // 1st
    'from-gray-200 to-gray-400',     // 2nd
    'from-orange-200 to-orange-400'  // 3rd
  ];
  const badgeIcons = [
    <Crown className="w-8 h-8 text-yellow-500 animate-bounce" />, // 1st
    <Award className="w-8 h-8 text-gray-400 animate-pulse" />,    // 2nd
    <Award className="w-8 h-8 text-orange-400 animate-pulse" />   // 3rd
  ];

  return (
    <div className="space-y-10">
      {/* Podium Top 3 */}
      <div className="flex flex-col md:flex-row gap-6 justify-center items-end">
        {podium.map((product, idx) => (
          <div
            key={product.name}
            className={`flex-1 flex flex-col items-center bg-gradient-to-br ${podiumColors[idx]} rounded-2xl shadow-2xl p-6 mx-2 animate-fade-in-up ${idx === 0 ? 'scale-110 z-10 border-4 border-yellow-400' : 'opacity-90'}`}
            style={{ minWidth: 180 }}
          >
            <div className="mb-2">{badgeIcons[idx]}</div>
            <div className="font-bold text-lg text-gray-900 mb-1">{product.name}</div>
            <div className="text-2xl font-extrabold text-yellow-900 mb-1">{product.totalQuantity} <span className="text-base font-medium text-gray-700">unités</span></div>
            <div className="text-sm text-gray-600">{product.orders} commandes</div>
            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold shadow ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-300 text-gray-800' : 'bg-orange-300 text-white'}`}>{idx === 0 ? '#1' : idx === 1 ? '#2' : '#3'}</span>
          </div>
        ))}
      </div>

      {/* Autres produits (liste animée) */}
      {others.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Autres produits populaires
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {others.map((product, idx) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all animate-fade-in">
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.orders} commandes</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{product.totalQuantity}</p>
                  <p className="text-xs text-gray-500">unités</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Produits par Revenus (visuel) */}
      <div className="mt-12">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Top Produits (Revenus)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topByRevenue.slice(0, 5).map((product, idx) => (
            <div key={product.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow hover:shadow-lg transition-all animate-fade-in">
              <div>
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-600">Prix moyen: {product.avgPrice?.toFixed(0)} DT</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">{product.totalRevenue?.toFixed(0)}</p>
                <p className="text-xs text-gray-500">DT</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant Régions
const RegionsTab = ({ insights }) => {
  // Podium top 3 par CA
  const regions = insights?.regionAnalysis || [];
  const sortedRegions = [...regions].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
  const podium = sortedRegions.slice(0, 3);
  const others = sortedRegions.slice(3, 8);

  const podiumColors = [
    'from-blue-300 to-blue-500', // 1st
    'from-gray-200 to-gray-400', // 2nd
    'from-indigo-200 to-indigo-400' // 3rd
  ];
  const badgeIcons = [
    <MapPin className="w-8 h-8 text-blue-600 animate-bounce" />, // 1st
    <Award className="w-8 h-8 text-gray-400 animate-pulse" />,   // 2nd
    <Award className="w-8 h-8 text-indigo-400 animate-pulse" />  // 3rd
  ];

  return (
    <div className="space-y-10">
      {/* Podium Top 3 */}
      <div className="flex flex-col md:flex-row gap-6 justify-center items-end">
        {podium.map((region, idx) => (
          <div
            key={region.region}
            className={`flex-1 flex flex-col items-center bg-gradient-to-br ${podiumColors[idx]} rounded-2xl shadow-2xl p-6 mx-2 animate-fade-in-up ${idx === 0 ? 'scale-110 z-10 border-4 border-blue-400' : 'opacity-90'}`}
            style={{ minWidth: 180 }}
          >
            <div className="mb-2">{badgeIcons[idx]}</div>
            <div className="font-bold text-lg text-gray-900 mb-1">{region.region}</div>
            <div className="text-2xl font-extrabold text-blue-900 mb-1">{region.totalRevenue?.toFixed(0) || 0} <span className="text-base font-medium text-gray-700">DT</span></div>
            <div className="text-sm text-gray-600">{region.totalOrders} commandes</div>
            <div className="text-xs text-gray-500">{region.clientCount} clients</div>
            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold shadow ${idx === 0 ? 'bg-blue-400 text-white' : idx === 1 ? 'bg-gray-300 text-gray-800' : 'bg-indigo-300 text-white'}`}>{idx === 0 ? 'Top 1' : idx === 1 ? 'Top 2' : 'Top 3'}</span>
          </div>
        ))}
      </div>

      {/* Autres régions (liste animée) */}
      {others.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" /> Autres régions performantes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {others.map((region, idx) => (
              <div key={region.region} className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all animate-fade-in">
                <div>
                  <p className="font-semibold text-gray-900">{region.region}</p>
                  <p className="text-xs text-gray-600">{region.clientCount} clients</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{region.totalRevenue?.toFixed(0)} DT</p>
                  <p className="text-xs text-gray-500">{region.totalOrders} commandes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Prédictions
const PredictionsTab = ({ insights }) => {
  // Prédictions principales
  const nextMonthRevenue = insights?.predictions?.nextMonthRevenue;
  const nextMonthOrders = insights?.predictions?.nextMonthOrders;
  const trendingProducts = insights?.predictions?.trendingProducts || [];
  const recommendations = insights?.predictions?.recommendations || [];

  return (
    <div className="space-y-10">
      {/* Prédiction principale (CA et commandes) */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch animate-fade-in">
        <div className="flex-1 bg-gradient-to-br from-purple-200 to-purple-400 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center">
          <Target className="w-12 h-12 text-purple-700 animate-pulse mb-2" />
          <div className="text-lg font-semibold text-purple-900 mb-1">Revenus prévus (prochain mois)</div>
          <div className="text-4xl font-extrabold text-purple-900 mb-2">{nextMonthRevenue?.toFixed(0) || 0} DT</div>
          <span className="bg-purple-500 text-white px-4 py-1 rounded-full font-bold text-sm shadow">Prédiction IA</span>
        </div>
        <div className="flex-1 bg-gradient-to-br from-blue-200 to-blue-400 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center">
          <BarChart3 className="w-12 h-12 text-blue-700 animate-bounce mb-2" />
          <div className="text-lg font-semibold text-blue-900 mb-1">Commandes prévues (prochain mois)</div>
          <div className="text-4xl font-extrabold text-blue-900 mb-2">{Math.round(nextMonthOrders || 0)}</div>
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full font-bold text-sm shadow">Prédiction IA</span>
        </div>
      </div>

      {/* Produits tendance (cartes insight) */}
      {trendingProducts.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" /> Produits en Tendance
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProducts.map((product, idx) => (
              <div key={product.product} className="flex flex-col items-start p-6 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-2xl shadow-lg animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" />
                  <span className="font-bold text-yellow-800 text-lg">{product.product}</span>
                </div>
                <div className="text-2xl font-extrabold text-yellow-900 mb-1">{product.totalSold} vendus</div>
                <div className="text-green-700 font-bold text-lg">+{product.trend?.toFixed(1)}% <span className="text-sm font-normal text-gray-700">croissance</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommandations IA */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" /> Conseils IA personnalisés
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`p-6 rounded-2xl shadow-lg animate-fade-in flex flex-col gap-2 ${rec.type === 'positive' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-orange-50 border-l-4 border-orange-400'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {rec.type === 'positive' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
                  <span className="font-bold text-lg text-gray-900">{rec.message}</span>
                </div>
                <div className="text-gray-700 text-md">{rec.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Performance
const PerformanceTab = ({ insights }) => {
  const performance = insights?.salesPerformance;
  // Calcul des pourcentages pour les barres
  const ordersGrowth = performance?.growth?.orders || 0;
  const revenueGrowth = performance?.growth?.revenue || 0;
  const avgOrderGrowth = performance?.growth?.avgOrderValue || 0;

  // Helper pour couleur dynamique
  const getGrowthColor = (val) => val >= 0 ? 'bg-green-400' : 'bg-red-400';
  const getTextColor = (val) => val >= 0 ? 'text-green-700' : 'text-red-700';
  const getBadge = (val) => (
    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold shadow ${val >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val >= 0 ? '+' : ''}{val.toFixed(1)}%</span>
  );

  return (
    <div className="space-y-10">
      {/* Mois Actuel & Précédent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
        <div className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-2xl shadow-2xl p-8 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-blue-500" /> Mois Actuel</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Commandes</span>
              <span className="text-2xl font-bold text-blue-700">{performance?.currentMonth?.orders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenus</span>
              <span className="text-2xl font-bold text-green-700">{performance?.currentMonth?.revenue?.toFixed(0) || 0} DT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Panier moyen</span>
              <span className="text-xl font-bold text-purple-700">{performance?.currentMonth?.avgOrderValue?.toFixed(0) || 0} DT</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl shadow-2xl p-8 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-gray-500" /> Mois Précédent</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Commandes</span>
              <span className="text-2xl font-bold text-blue-700">{performance?.lastMonth?.orders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenus</span>
              <span className="text-2xl font-bold text-green-700">{performance?.lastMonth?.revenue?.toFixed(0) || 0} DT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Panier moyen</span>
              <span className="text-xl font-bold text-purple-700">{performance?.lastMonth?.avgOrderValue?.toFixed(0) || 0} DT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Croissance avec barres et badges dynamiques */}
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-green-500" /> Croissance</h3>
        <div className="space-y-6">
          {/* Commandes */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Commandes</span>
              <span className={`font-bold ${getTextColor(ordersGrowth)}`}>{getBadge(ordersGrowth)}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-4 ${getGrowthColor(ordersGrowth)}`} style={{ width: `${Math.min(Math.abs(ordersGrowth), 100)}%`, transition: 'width 1s' }}></div>
            </div>
          </div>
          {/* Revenus */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Revenus</span>
              <span className={`font-bold ${getTextColor(revenueGrowth)}`}>{getBadge(revenueGrowth)}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-4 ${getGrowthColor(revenueGrowth)}`} style={{ width: `${Math.min(Math.abs(revenueGrowth), 100)}%`, transition: 'width 1s' }}></div>
            </div>
          </div>
          {/* Panier moyen */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Panier moyen</span>
              <span className={`font-bold ${getTextColor(avgOrderGrowth)}`}>{getBadge(avgOrderGrowth)}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-4 ${getGrowthColor(avgOrderGrowth)}`} style={{ width: `${Math.min(Math.abs(avgOrderGrowth), 100)}%`, transition: 'width 1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantIA;
