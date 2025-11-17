import React, { useState } from 'react';
import BonCommandeFournisseurList from './../../components/bonCommandeFournisseur/BonCommandeFournisseurList';
import BonCommandeFournisseurForm from './../../components/bonCommandeFournisseur/BonCommandeFournisseurForm';
import BonCommandeFournisseurViewer from './../../components/bonCommandeFournisseur/BonCommandeFournisseurViewer';

export default function BonCommandeFournisseur() {
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

  const handleBack = () => {
    setCurrentView('list');
    setSelectedBon(null);
  };

  return (
    <div className="p-6">
      {currentView === 'list' && (
        <BonCommandeFournisseurList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
        />
      )}
      
      {(currentView === 'create' || currentView === 'edit') && (
        <BonCommandeFournisseurForm
          existingBon={currentView === 'edit' ? selectedBon : null}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
      
      {currentView === 'view' && selectedBon && (
        <BonCommandeFournisseurViewer
          bon={selectedBon}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
