import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FacturesList from '../../components/FacturesList';
import FactureForm from '../../components/FactureForm';
import FactureViewer from '../../components/FactureViewer';

function Factures() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [selectedFacture, setSelectedFacture] = useState(null);

  const handleCreateNew = () => {
    setSelectedFacture(null);
    setCurrentView('create');
  };

  const handleEdit = (facture) => {
    setSelectedFacture(facture);
    setCurrentView('edit');
  };

  const handleView = (facture) => {
    setSelectedFacture(facture);
    setCurrentView('view');
  };

  const handleSuccess = () => {
    setCurrentView('list');
    setSelectedFacture(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedFacture(null);
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedFacture(null);
  };

  return (
    <div className="p-6">
      {currentView === 'list' && (
        <FacturesList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
        />
      )}
      
      {(currentView === 'create' || currentView === 'edit') && (
        <FactureForm
          existingFacture={currentView === 'edit' ? selectedFacture : null}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
      
      {currentView === 'view' && selectedFacture && (
        <FactureViewer
          facture={selectedFacture}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default Factures;