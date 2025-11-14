import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function FicheProductionArtisan() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
        <h1>Fiche de Production Par Artisan</h1>
    </div>
  );
}

export default FicheProductionArtisan;
