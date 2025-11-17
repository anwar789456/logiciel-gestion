import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BonReceptionList from '../../components/bonReception/BonReceptionList';
import BonReceptionForm from '../../components/bonReception/BonReceptionForm';
import BonReceptionViewer from '../../components/bonReception/BonReceptionViewer';

export default function BonReception() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [selectedBon, setSelectedBon] = useState(null);

  const handleCreateNew = () => {
    setSelectedBon(null);
    setCurrentView('create');
  };

  const handleEdit = (bon) => {
    setSelectedBon(bon);
    setCurrentView('edit');
  };

  const handleView = (bon) => {
    setSelectedBon(bon);
    setCurrentView('view');
  };

  const handleSuccess = () => {
    setCurrentView('list');
    setSelectedBon(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedBon(null);
  };

  return (
    <div className='pt-4 px-8'>
      {currentView === 'list' && (
        <BonReceptionList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
        />
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <BonReceptionForm
          existingBon={selectedBon}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {currentView === 'view' && selectedBon && (
        <BonReceptionViewer
          bon={selectedBon}
          onEdit={handleEdit}
          onBack={handleCancel}
        />
      )}
    </div>
  );
}
