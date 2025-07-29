import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Stats() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        {t('stats')}
      </h1>
    </div>
  );
}

export default Stats;