import React from 'react'
import { useTranslation } from 'react-i18next';

function Devis() {
  const { t } = useTranslation();

  return (
    <div className=''>
      <h1 className="text-center text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        {t('devis')}
      </h1>
    </div>
  )
}

export default Devis
