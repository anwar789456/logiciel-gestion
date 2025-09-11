import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Receipt, 
  Truck, 
  TicketCheck, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Calendar,
  DollarSign,
  Package,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as devis from '../../api/devis/devis.js';
import * as facture from '../../api/facture/facture.js';
import * as bonLivraisonApi from '../../api/bonLivraisonApi.js';
import * as recuPaiementApi from '../../api/recuPaiementApi.js';
import CRMDocumentConverter from '../../components/crm/CRMDocumentConverter';

function CRM() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    devis: { count: 0, total: 0, pending: 0 },
    factures: { count: 0, total: 0, paid: 0, unpaid: 0 },
    bonLivraisons: { count: 0, delivered: 0, pending: 0 },
    recuPaiements: { count: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const [devisData, facturesData, bonLivraisonsData, recuPaiementsData] = await Promise.all([
        devis.getAllDevis(),
        facture.getAllFactures(),
        bonLivraisonApi.getAllBonLivraisons(),
        recuPaiementApi.getAllRecuPaiements()
      ]);

      // Calculate devis stats
      const devisStats = {
        count: devisData.length,
        total: devisData.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
        pending: devisData.filter(item => item.status === 'pending').length
      };

      // Calculate factures stats
      const facturesStats = {
        count: facturesData.length,
        total: facturesData.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
        paid: facturesData.filter(item => item.status === 'paid').length,
        unpaid: facturesData.filter(item => item.status === 'pending').length
      };

      // Calculate bon livraisons stats
      const bonLivraisonsStats = {
        count: bonLivraisonsData.length,
        delivered: bonLivraisonsData.filter(item => item.status === 'delivered').length,
        pending: bonLivraisonsData.filter(item => item.status === 'pending').length
      };

      // Calculate recu paiements stats
      const recuPaiementsStats = {
        count: recuPaiementsData.length,
        total: recuPaiementsData.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
      };

      setStats({
        devis: devisStats,
        factures: facturesStats,
        bonLivraisons: bonLivraisonsStats,
        recuPaiements: recuPaiementsStats
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, icon: Icon, color, stats, onClick }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${color} cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <div className="space-y-1">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">{stat.label}:</span>
                <span className="ml-2">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')} dark:bg-gray-700`}>
          <Icon className={`h-8 w-8 ${color.replace('border-l-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon: Icon, color, onClick }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border cursor-pointer hover:shadow-lg transition-all hover:scale-105 ${color}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('-200', '-100')} dark:bg-gray-700`}>
          <Icon className={`h-5 w-5 ${color.replace('border-', 'text-').replace('-200', '-600')}`} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CRM Dashboard</h1>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Devis"
          icon={FileText}
          color="border-l-blue-500"
          onClick={() => navigate('/devis')}
          stats={[
            { label: 'Total', value: stats.devis.count },
            { label: 'Montant', value: `${stats.devis.total.toFixed(3)} DT` },
            { label: 'En attente', value: stats.devis.pending }
          ]}
        />
        
        <StatCard
          title="Factures"
          icon={Receipt}
          color="border-l-green-500"
          onClick={() => navigate('/factures')}
          stats={[
            { label: 'Total', value: stats.factures.count },
            { label: 'Montant', value: `${stats.factures.total.toFixed(3)} DT` },
            { label: 'Payées', value: stats.factures.paid },
            { label: 'Impayées', value: stats.factures.unpaid }
          ]}
        />
        
        <StatCard
          title="Bons de Livraison"
          icon={Truck}
          color="border-l-orange-500"
          onClick={() => navigate('/bon-livraison')}
          stats={[
            { label: 'Total', value: stats.bonLivraisons.count },
            { label: 'Livrés', value: stats.bonLivraisons.delivered },
            { label: 'En attente', value: stats.bonLivraisons.pending }
          ]}
        />
        
        <StatCard
          title="Reçus de Paiement"
          icon={TicketCheck}
          color="border-l-purple-500"
          onClick={() => navigate('/recue-de-paiement-sur-commande')}
          stats={[
            { label: 'Total', value: stats.recuPaiements.count },
            { label: 'Montant', value: `${stats.recuPaiements.total.toFixed(3)} DT` }
          ]}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
          Actions Rapides
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            title="Nouveau Devis"
            description="Créer un nouveau devis client"
            icon={Plus}
            color="border-blue-200"
            onClick={() => navigate('/devis')}
          />
          
          <QuickAction
            title="Nouvelle Facture"
            description="Créer une nouvelle facture"
            icon={Plus}
            color="border-green-200"
            onClick={() => navigate('/factures')}
          />
          
          <QuickAction
            title="Nouveau Bon de Livraison"
            description="Créer un nouveau bon de livraison"
            icon={Plus}
            color="border-orange-200"
            onClick={() => navigate('/bon-livraison')}
          />
          
          <QuickAction
            title="Nouveau Reçu"
            description="Créer un nouveau reçu de paiement"
            icon={Plus}
            color="border-purple-200"
            onClick={() => navigate('/recue-de-paiement-sur-commande')}
          />
        </div>
      </div>

      {/* Document Converter */}
      <CRMDocumentConverter onRefresh={fetchAllStats} />

      {/* Recent Activity Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-blue-600" />
          Résumé d'Activité
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
            <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(stats.factures.total + stats.recuPaiements.total).toFixed(3)} DT
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Chiffre d'affaires total</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-gray-700 rounded-lg">
            <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.bonLivraisons.delivered}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Livraisons effectuées</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 dark:bg-gray-700 rounded-lg">
            <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.devis.pending + stats.factures.unpaid + stats.bonLivraisons.pending}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Documents en attente</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CRM;
