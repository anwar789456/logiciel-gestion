import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  FileText, 
  Receipt, 
  Truck, 
  Check, 
  X, 
  Plus,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import * as facture from '../../api/facture/facture.js';
import * as bonLivraisonApi from '../../api/bonLivraisonApi.js';
import * as devis from '../../api/devis/devis.js';

function CRMDocumentConverter({ onRefresh }) {
  const [activeTab, setActiveTab] = useState('facture-to-bon');
  const [sourceDocuments, setSourceDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadSourceDocuments();
  }, [activeTab]);

  const loadSourceDocuments = async () => {
    setLoading(true);
    try {
      let documents = [];
      if (activeTab === 'facture-to-bon') {
        documents = await facture.getAllFactures();
      } else if (activeTab === 'bon-to-facture') {
        documents = await bonLivraisonApi.getAllBonLivraisons();
      } else if (activeTab === 'devis-to-facture') {
        documents = await devis.getAllDevis();
      }
      setSourceDocuments(documents);
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.find(doc => doc._id === document._id);
      if (isSelected) {
        return prev.filter(doc => doc._id !== document._id);
      } else {
        return [...prev, document];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredDocs = getFilteredDocuments();
    if (selectedDocuments.length === filteredDocs.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocs);
    }
  };

  const getFilteredDocuments = () => {
    return sourceDocuments.filter(doc => {
      const matchesSearch = 
        doc.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.devisNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.factureNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.bonLivraisonNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const createDocumentFromSelection = async () => {
    if (selectedDocuments.length === 0) {
      alert('Veuillez sélectionner au moins un document');
      return;
    }

    console.log('Documents sélectionnés:', selectedDocuments);
    console.log('Premier document structure:', JSON.stringify(selectedDocuments[0], null, 2));

    setLoading(true);
    try {
      if (activeTab === 'facture-to-bon') {
        // Créer bon de livraison à partir de factures
        const articles = selectedDocuments.flatMap(facture => {
          // Essayer différents noms de champs pour les articles
          const items = facture.items || facture.articles || facture.products || [];
          console.log('Articles de la facture:', items);
          return items.map(item => ({
            description: item.description,
            quantity: item.quantity || 1,
            refColor: item.refColor || ''
          }));
        });
        
        // Validation pour éviter les articles vides
        if (articles.length === 0) {
          alert('Aucun article trouvé dans les factures sélectionnées');
          return;
        }
        
        const bonData = {
          clientName: selectedDocuments[0].clientName,
          clientPhone: selectedDocuments[0].clientPhone,
          clientAddress: selectedDocuments[0].clientAddress,
          items: articles, // Utiliser 'items' au lieu de 'articles' pour correspondre au modèle backend
          sourceFactures: selectedDocuments.map(f => f._id),
          status: 'pending',
          date: new Date().toISOString()
        };
        
        console.log('Données bon de livraison:', JSON.stringify(bonData, null, 2));
        
        await bonLivraisonApi.createBonLivraison(bonData);
        alert(`Bon de livraison créé à partir de ${selectedDocuments.length} facture(s)`);
        
      } else if (activeTab === 'bon-to-facture') {
        // Créer facture à partir de bons de livraison
        const items = selectedDocuments.flatMap(bon => {
          // Essayer différents noms de champs pour les articles
          const articles = bon.articles || bon.items || bon.products || [];
          console.log('Articles du bon:', articles);
          return articles.map(article => ({
            description: article.description,
            quantity: article.quantity || 1,
            unitPrice: 10, // Prix par défaut
            discount: 0
          }));
        });
        
        // Validation pour éviter les items vides
        if (items.length === 0) {
          alert('Aucun article trouvé dans les documents sélectionnés');
          return;
        }
        
        const factureData = {
          clientType: 'particulier',
          clientName: selectedDocuments[0].clientName,
          clientPhone: selectedDocuments[0].clientPhone,
          clientAddress: selectedDocuments[0].clientAddress,
          items: items,
          sourceBonLivraisons: selectedDocuments.map(b => b._id)
        };
        
        console.log('Données facture (bon->facture):', JSON.stringify(factureData, null, 2));
        console.log('Items détail:', items);
        await facture.createFacture(factureData);
        alert(`Facture créée à partir de ${selectedDocuments.length} bon(s) de livraison`);
        
      } else if (activeTab === 'devis-to-facture') {
        // Créer facture à partir de devis
        const items = selectedDocuments.flatMap(devis => {
          // Essayer différents noms de champs pour les articles
          const articles = devis.articles || devis.items || devis.products || [];
          console.log('Articles du devis:', articles);
          return articles.map(article => ({
            description: article.description,
            quantity: article.quantity || 1,
            unitPrice: article.unitPrice || article.price || 10,
            discount: article.discount || 0
          }));
        });
        
        const factureData = {
          clientType: 'particulier',
          clientName: selectedDocuments[0].clientName,
          clientPhone: selectedDocuments[0].clientPhone,
          clientAddress: selectedDocuments[0].clientAddress,
          items: items,
          sourceDevis: selectedDocuments.map(d => d._id)
        };
        
        // Validation pour éviter les items vides
        if (items.length === 0) {
          alert('Aucun article trouvé dans les documents sélectionnés');
          return;
        }
        
        console.log('Données facture (devis->facture):', JSON.stringify(factureData, null, 2));
        console.log('Items détail:', items);
        await facture.createFacture(factureData);
        alert(`Facture créée à partir de ${selectedDocuments.length} devis`);
      }

      setSelectedDocuments([]);
      loadSourceDocuments();
      if (onRefresh) onRefresh();
      
    } catch (error) {
      console.error('Erreur lors de la création du document:', error);
      alert('Erreur lors de la création du document');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Payée', color: 'bg-green-100 text-green-800' },
      delivered: { label: 'Livré', color: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
      accepted: { label: 'Accepté', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const tabs = [
    {
      id: 'facture-to-bon',
      label: 'Factures → Bon de Livraison',
      icon: Receipt,
      targetIcon: Truck
    },
    {
      id: 'bon-to-facture',
      label: 'Bons de Livraison → Facture',
      icon: Truck,
      targetIcon: Receipt
    },
    {
      id: 'devis-to-facture',
      label: 'Devis → Facture',
      icon: FileText,
      targetIcon: Receipt
    }
  ];

  const filteredDocuments = getFilteredDocuments();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <ArrowRightLeft className="h-6 w-6 mr-2 text-blue-600" />
        Convertisseur de Documents
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            <ArrowRightLeft size={12} />
            <tab.targetIcon size={16} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher par client, numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="paid">Payé</option>
            <option value="delivered">Livré</option>
            <option value="accepted">Accepté</option>
          </select>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <Check size={14} />
            <span>
              {selectedDocuments.length === filteredDocuments.length ? 'Désélectionner tout' : 'Sélectionner tout'}
            </span>
          </button>
          
          {selectedDocuments.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDocuments.length} document(s) sélectionné(s)
            </span>
          )}
        </div>

        {selectedDocuments.length > 0 && (
          <button
            onClick={createDocumentFromSelection}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Plus size={16} />
            <span>Créer Document</span>
          </button>
        )}
      </div>

      {/* Documents List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun document trouvé
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="flex items-center space-x-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 border-b">
              <div className="w-5 h-5"></div> {/* Checkbox column */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="font-semibold">Numéro / Client</div>
                <div className="font-semibold">Date</div>
                <div className="font-semibold">Montant</div>
                <div className="font-semibold">Statut</div>
              </div>
            </div>
            
            {/* Documents */}
            {filteredDocuments.map(document => (
            <div
              key={document._id}
              className={`flex items-center space-x-4 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedDocuments.find(doc => doc._id === document._id)
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleDocumentSelect(document)}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedDocuments.find(doc => doc._id === document._id)
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300 dark:border-gray-500'
              }`}>
                {selectedDocuments.find(doc => doc._id === document._id) && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {document.devisNumber || document.factureNumber || document.bonLivraisonNumber}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {document.clientName}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(document.createdAt || document.date).toLocaleDateString('fr-FR')}
                </div>
                
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {document.totalAmount ? `${document.totalAmount.toFixed(3)} DT` : 'N/A'}
                </div>
                
                <div>
                  {getStatusBadge(document.status)}
                </div>
              </div>
            </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default CRMDocumentConverter;
