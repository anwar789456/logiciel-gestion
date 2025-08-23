import React, { useState } from 'react';
import BonLivraisonList from '../../components/BonLivraisonList';
import BonLivraisonForm from '../../components/BonLivraisonForm';
import BonLivraisonViewer from '../../components/BonLivraisonViewer';

export default function BonLivraison() {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [selectedBonLivraison, setSelectedBonLivraison] = useState(null);

  const handleCreateNew = () => {
    setSelectedBonLivraison(null);
    setCurrentView('create');
  };

  const handleEdit = (bonLivraison) => {
    setSelectedBonLivraison(bonLivraison);
    setCurrentView('edit');
  };

  const handleView = (bonLivraison) => {
    setSelectedBonLivraison(bonLivraison);
    setCurrentView('view');
  };

  const handleSuccess = () => {
    setCurrentView('list');
    setSelectedBonLivraison(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedBonLivraison(null);
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedBonLivraison(null);
  };

  return (
    <div className="p-6">
      {currentView === 'list' && (
        <BonLivraisonList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
        />
      )}
      
      {(currentView === 'create' || currentView === 'edit') && (
        <BonLivraisonForm
          existingBonLivraison={currentView === 'edit' ? selectedBonLivraison : null}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
      
      {currentView === 'view' && selectedBonLivraison && (
        <BonLivraisonViewer
          bonLivraison={selectedBonLivraison}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
