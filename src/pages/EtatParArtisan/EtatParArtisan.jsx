import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function EtatParArtisan() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
        <h1>Etat Par Artisan</h1>
    </div>
  );
}

export default EtatParArtisan;
