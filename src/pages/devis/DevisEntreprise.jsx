import React, { useState } from 'react';
import DevisList from '../../components/DevisList';
import DevisFormEntreprise from '../../components/DevisFormEntreprise';
import DevisViewerEntreprise from '../../components/DevisViewerEntreprise';

function DevisEntreprise() {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [selectedDevis, setSelectedDevis] = useState(null);

  const handleCreateNew = () => {
    setSelectedDevis(null);
    setCurrentView('create');
  };

  const handleEdit = (devis) => {
    setSelectedDevis(devis);
    setCurrentView('edit');
  };

  const handleView = (devis) => {
    setSelectedDevis(devis);
    setCurrentView('view');
  };

  const handleSuccess = () => {
    setCurrentView('list');
    setSelectedDevis(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedDevis(null);
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedDevis(null);
  };

  return (
    <div className="p-6">
      {currentView === 'list' && (
        <DevisList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
          typeClient="entreprise"
        />
      )}
      {(currentView === 'create' || currentView === 'edit') && (
        <DevisFormEntreprise
          existingDevis={currentView === 'edit' ? selectedDevis : null}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
      {currentView === 'view' && selectedDevis && (
        <DevisViewerEntreprise
          devis={selectedDevis}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default DevisEntreprise; 