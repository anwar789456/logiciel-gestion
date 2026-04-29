import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function FicheProductionArtisan() {
  const { t } = useTranslation();

  return (
    <div className="p-2 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Fiche de Production Par Artisan</h1>
    </div>
  );
}

export default FicheProductionArtisan;
