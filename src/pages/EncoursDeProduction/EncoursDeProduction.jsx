import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function EncoursDeProduction() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
        <h1>EncoursDeProduction</h1>
    </div>
  );
}

export default EncoursDeProduction;
