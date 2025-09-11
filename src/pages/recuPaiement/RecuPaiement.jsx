import React, { useState } from 'react';
import RecuPaiementList from '../../components/recuPaiment/RecuPaiementList';
import RecuPaiementForm from '../../components/recuPaiment/RecuPaiementForm';
import RecuPaiementViewer from '../../components/recuPaiment/RecuPaiementViewer';

const RecuPaiement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedRecuPaiement, setSelectedRecuPaiement] = useState(null);

  const handleCreateNew = () => {
    setSelectedRecuPaiement(null);
    setCurrentView('form');
  };

  const handleEdit = (recuPaiement) => {
    setSelectedRecuPaiement(recuPaiement);
    setCurrentView('form');
  };

  const handleView = (recuPaiement) => {
    setSelectedRecuPaiement(recuPaiement);
    setCurrentView('view');
  };

  const handleSave = (savedRecuPaiement) => {
    setCurrentView('list');
    setSelectedRecuPaiement(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedRecuPaiement(null);
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedRecuPaiement(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="py-6">
        {currentView === 'list' && (
          <RecuPaiementList
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onView={handleView}
          />
        )}

        {currentView === 'form' && (
          <RecuPaiementForm
            existingRecuPaiement={selectedRecuPaiement}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {currentView === 'view' && (
          <RecuPaiementViewer
            recuPaiement={selectedRecuPaiement}
            onEdit={handleEdit}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default RecuPaiement;
