import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Package, 
  Eye,
  Search,
  ChevronDown
} from 'lucide-react';
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
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone ou gouvernorat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCommandes.map((commande) => (
          <div
            key={commande._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="text-blue-600 dark:text-blue-300" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {commande.nomPrenom || 'Nom non spécifié'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {commande._id?.slice(-8) || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar size={16} className="mr-2" />
                  {commande.createdAt ? new Date(commande.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Package size={16} className="mr-2" />
                  {getTotalQuantity(commande.cartItems)} article{getTotalQuantity(commande.cartItems) > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span className="text-sm">
                    {commande.gouvernorat || 'Non spécifié'}, {commande.pays || 'Tunisie'}
                  </span>
                </div>
                {commande.telephone && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Phone size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm">{commande.telephone}</span>
                  </div>
                )}
                {commande.email && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm truncate">{commande.email}</span>
                  </div>
                )}
                {commande.comments && (
                  <div className="flex items-start text-gray-600 dark:text-gray-300">
                    <MessageCircle size={16} className="mr-2 mt-0.5 text-gray-400" />
                    <span className="text-sm">{commande.comments}</span>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total de la commande</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {getTotalPrice(commande.cartItems).toFixed(2)} TND
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => openModal(commande)}
                className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group-hover:bg-blue-700"
              >
                <Eye size={16} className="mr-2" />
                Voir les détails
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCommandes.length === 0 && !loading && (
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