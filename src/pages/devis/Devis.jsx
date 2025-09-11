import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DevisList from '../../components/devis/DevisList';
import DevisForm from '../../components/devis/DevisForm';
import DevisViewer from '../../components/devis/DevisViewer';

function Devis() {
  const { t } = useTranslation();
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
        />
      )}
      
      {(currentView === 'create' || currentView === 'edit') && (
        <DevisForm
          existingDevis={currentView === 'edit' ? selectedDevis : null}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
      
      {currentView === 'view' && selectedDevis && (
        <DevisViewer
          devis={selectedDevis}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default Devis;
