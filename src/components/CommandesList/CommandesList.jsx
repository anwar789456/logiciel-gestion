import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User, Phone, Mail, MapPin, MessageCircle, Package, Eye, Search, Users, Contact, DollarSign, Settings } from 'lucide-react';
import { FetchAllCommandeItems } from '../../api/commandes/commande.js';
import { FetchAllProductItems } from '../../api/product.js';

function CommandesList() {
  const { t } = useTranslation();
  const [commandes, setCommandes] = useState([]);
  const [products, setProducts] = useState([]); // Add products state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both commandes and products
        const [commandesData, productsData] = await Promise.all([
          FetchAllCommandeItems(),
          FetchAllProductItems()
        ]);
        setCommandes(commandesData);
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to get product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p.idProd === productId);
    return product ? product.nom : `Produit ID: ${productId}`;
  };

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const openModal = (commande) => {
    setSelectedCommande(commande);
    setIsModalOpen(true);
    setIsClosing(false);
    setIsOpening(true);
    
    // Trigger opening animation after a brief delay
    setTimeout(() => {
      setIsOpening(false);
    }, 50); // Small delay to ensure the modal is rendered before animation
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedCommande(null);
      setIsModalOpen(false);
      setIsClosing(false);
      setIsOpening(false);
    }, 200); // Match animation duration
  };

  const filteredCommandes = commandes.filter(commande => {
    const searchLower = searchTerm.toLowerCase();
    return (
      commande.nomPrenom?.toLowerCase().includes(searchLower) ||
      commande.email?.toLowerCase().includes(searchLower) ||
      commande.telephone?.includes(searchTerm) ||
      commande.gouvernorat?.toLowerCase().includes(searchLower)
    );
  });

  const getTotalPrice = (cartItems) => {
    return cartItems?.reduce((total, item) => total + (item.totalPrice || 0), 0) || 0;
  };

  const getTotalQuantity = (cartItems) => {
    return cartItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <Package size={64} className="mx-auto mb-4" />
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone ou gouvernorat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>Client</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center space-x-2">
                    <Contact size={16} />
                    <span>Contact</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>Localisation</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Date</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center space-x-2">
                    <Package size={16} />
                    <span>Articles</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center space-x-2">
                    <Settings size={16} />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredCommandes.map((commande) => (
                <tr key={commande._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <User className="mr-2 text-gray-400" size={16} />
                        <span className="truncate max-w-[200px]">{commande.nomPrenom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {commande.email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          <span className="truncate max-w-[200px]">{commande.email}</span>
                        </div>
                      )}
                      {commande.telephone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          <span>{commande.telephone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPin size={14} className="mr-2 text-gray-400" />
                      <span>{commande.gouvernorat || 'Non spécifié'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      <span>
                        {commande.createdAt ? new Date(commande.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Package size={14} className="mr-2 text-gray-400" />
                      <span>{getTotalQuantity(commande.cartItems)} article{getTotalQuantity(commande.cartItems) > 1 ? 's' : ''}</span>
                    </div>
                    {commande.comments && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <MessageCircle size={12} className="mr-1" />
                        <span className="truncate max-w-[150px]">{commande.comments}</span>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openModal(commande)}
                      className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Eye size={14} className="mr-1" />
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCommandes.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'Essayez de modifier vos critères de recherche.'
                : 'Il n\'y a pas de commandes pour le moment.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal for command details with animations */}
      {(selectedCommande || isModalOpen) && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ease-out ${
            isClosing 
              ? 'bg-transparent bg-opacity-0 backdrop-blur-[5px]' 
              : isOpening 
              ? 'bg-transparent bg-opacity-0 backdrop-blur-[5px]'
              : 'bg-transparent bg-opacity-50 backdrop-blur-sm'
          }`}
          style={{
            opacity: isClosing ? 0 : isOpening ? 0 : 1,
          }}
        >
          <div 
            ref={modalRef}
            className={`bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl transition-all duration-200 ease-out ${
              isClosing 
                ? 'transform scale-90 opacity-0' 
                : isOpening
                ? 'transform scale-90 opacity-0'
                : 'transform scale-100 opacity-100'
            }`}
            style={{
              transformOrigin: 'center',
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Détails de la commande
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl"
                >
                  ×
                </button>
              </div>
              
              {/* Customer Info */}
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-md">
                  <p><strong className='text-gray-900 dark:text-gray-300'>Nom:</strong><span className='text-gray-900 dark:text-gray-200'> {selectedCommande?.nomPrenom || 'Non spécifié'}</span></p>
                  <p><strong className='text-gray-900 dark:text-gray-300'>Email:</strong><span className='text-gray-900 dark:text-gray-200'> {selectedCommande?.email || 'Non spécifié'}</span></p>
                  <p><strong className='text-gray-900 dark:text-gray-300'>Téléphone:</strong><span className='text-gray-900 dark:text-gray-200'> {selectedCommande?.telephone || 'Non spécifié'}</span></p>
                  <p><strong className='text-gray-900 dark:text-gray-300'>Localisation:</strong><span className='text-gray-900 dark:text-gray-200'> {selectedCommande?.gouvernorat}, {selectedCommande?.pays}</span></p>
                  <p><strong className='text-gray-900 dark:text-gray-300'>Date:</strong><span className='text-gray-900 dark:text-gray-200'> {selectedCommande?.createdAt ? new Date(selectedCommande.createdAt).toLocaleString('fr-FR') : 'Non spécifiée'}</span></p>
                  {selectedCommande?.comments && (
                    <p><strong className="md:col-span-2 text-gray-900 dark:text-gray-300">Commentaires:</strong><span className="md:col-span-2 text-gray-900 dark:text-gray-100"> {selectedCommande.comments}</span></p>
                  )}
                </div>
              </div>

              {/* Cart Items */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Articles commandés</h3>
                <div className="space-y-4">
                  {selectedCommande?.cartItems?.map((item, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-2">
                            {getProductName(item.idProd)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">ID Produit: {item.idProd}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Quantité: {item.quantity}</p>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Prix: {item.totalPrice} TND</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          {item.selectedOptionTissue && (
                            <p><strong>Tissu:</strong> {item.selectedOptionTissue.option_name} (+{item.selectedOptionTissue.prix_option} TND)</p>
                          )}
                          {item.selectedOptionDimension && (
                            <div>
                              <p><strong>Dimensions:</strong> {item.selectedOptionDimension.longueur}cm × {item.selectedOptionDimension.largeur}cm</p>
                              {item.selectedOptionDimension.prix_option && (
                                <p><strong>Prix dimension:</strong> +{item.selectedOptionDimension.prix_option} TND</p>
                              )}
                              {item.selectedOptionDimension.prix_coffre && (
                                <p><strong>Prix coffre:</strong> +{item.selectedOptionDimension.prix_coffre} TND</p>
                              )}
                            </div>
                          )}
                          {item.selectedOptionCoffre && (
                            <p><strong>Option coffre:</strong> {item.selectedOptionCoffre}</p>
                          )}
                          {item.directionCanapeAngle && (
                            <p><strong>Direction angle:</strong> {item.directionCanapeAngle}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total de la commande:</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {getTotalPrice(selectedCommande?.cartItems).toFixed(2)} TND
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommandesList;