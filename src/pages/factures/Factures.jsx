import React from 'react';
import { useTranslation } from 'react-i18next';
import { CopyPlus, FolderOutput } from 'lucide-react';

function Factures() {
  const { t } = useTranslation();

  return (
    <div>
      <div className='pl-8 pt-4 pb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700'>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t('factures')}
          </h1>
        </div>
        <div className='flex pr-8'>
          <button
            className='flex items-center bg-transparent border border-blue-600
              hover:bg-blue-600 text-blue-600 font-bold 
              hover:text-white
              py-2 px-4 rounded-xl cursor-pointer
              mr-2
              shadow-lg hover:shadow-lg active:shadow-inner
              active:scale-85
              transition-all duration-400 ease-in-out'
          >

            <FolderOutput className='mr-2 mt-0.5' size={20} />
            {t('export_button')}
          </button>

          <button 
            className='flex items-center bg-blue-600 
            hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-xl 
            active:scale-85
            cursor-pointer shadow-lg hover:shadow-lg active:shadow-inner 
            transition-all duration-400 ease-in-out'
          >
            <CopyPlus className='mr-2 mt-0.5' size={20} />
            {t('ajouter_facture')}
          </button>

        </div>
      </div>
    </div>
  );
}

export default Factures;