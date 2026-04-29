import React from 'react'
import { useTranslation } from 'react-i18next'
export default function Fournisseur() {
    const { t } = useTranslation();

    return (
    <div className='pt-4 px-3 sm:px-8'>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Fournisseur</h1>
    </div>
)
}
