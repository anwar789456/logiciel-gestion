import React from 'react'
import { FolderOutput, CopyPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
export default function FicheEmploye() {
    const { t } = useTranslation();
    return (
        <div className='pl-8 pt-4 pb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700'>
            <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                {(t('fiche_employe'))}
            </h1>
            </div>
            <div className='flex pr-8'>
                <button 
                    className='flex items-center bg-blue-600 
                    hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-xl 
                    active:scale-85
                    cursor-pointer shadow-lg hover:shadow-lg active:shadow-inner 
                    transition-all duration-400 ease-in-out'
                >
                    <CopyPlus className='mr-2 mt-0.5' size={20} />
                    Ajouter Employé
                </button>
            </div>
        </div>
    )
}
