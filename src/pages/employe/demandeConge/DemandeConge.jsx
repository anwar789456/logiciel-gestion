import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import html2pdf from 'html2pdf.js';
import CongeDocument from '../../../components/employe/CongeDocument';

export default function DemandeConge() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    motif: '',
    autreMotif: '',
    dateDebut: '',
    dateFin: '',
    dateEffectuerConge: '',
    decisionResponsable: ''
  });
  
  const [showDocument, setShowDocument] = useState(false);
  const documentRef = useRef(null);
  
  // Mock employee info - in a real app, this would come from your auth system or API
  const employeeInfo = {
    name: 'Souleima GHANNEY',
    department: 'Architecture d\'intérieur',
    manager: 'Faiez Samet'
  };

  const motifOptions = [
    'Maladie',
    'Congé',
    'Décès',
    'Congés sans solde',
    'Congé maternité',
    'Congé parental',
    'Mariage',
    'Pour évènements familiaux',
    'autre'
  ];

  const decisionOptions = [
    'Accord total',
    'Accord partiel',
    'Refus'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Show the document preview
    setShowDocument(true);
    // Here you would typically send the data to your backend
  };
  
  const handleDownloadPDF = () => {
    const element = documentRef.current;
    
    const options = {
      margin: 10,
      filename: `demande_conge_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(options).from(element).save();
  };
  
  const handleBack = () => {
    setShowDocument(false);
  };

  return (
    <div className='mt-4 px-8'>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Demande de Congé</h1>
      
      {!showDocument ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Motif */}
          <div className="space-y-4">
            <div>
              <label htmlFor="motif" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif</label>
              <select
                id="motif"
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="" disabled>Sélectionnez un motif</option>
                {motifOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            {/* Conditional input field for 'autre' */}
            {formData.motif === 'autre' && (
              <div>
                <label htmlFor="autreMotif" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Précisez le motif</label>
                <input
                  type="text"
                  id="autreMotif"
                  name="autreMotif"
                  value={formData.autreMotif}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            )}
          </div>

          {/* Sollicite un congé (date range) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sollicite un congé du</label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">au</label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Date effectuer conge */}
          <div>
            <label htmlFor="dateEffectuerConge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date effectuer congé</label>
            <input
              type="date"
              id="dateEffectuerConge"
              name="dateEffectuerConge"
              value={formData.dateEffectuerConge}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Date confirmée par l'administrateur</p>
          </div>

          {/* Decision du responsable du service */}
          <div>
            <label htmlFor="decisionResponsable" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Décision du responsable du service</label>
            <select
              id="decisionResponsable"
              name="decisionResponsable"
              value={formData.decisionResponsable}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="" disabled>Sélectionnez une décision</option>
              {decisionOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
            >
              Soumettre la demande
            </button>
          </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-300"
            >
              Retour au formulaire
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300"
            >
              Télécharger PDF
            </button>
          </div>
          
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <CongeDocument ref={documentRef} formData={formData} employeeInfo={employeeInfo} />
          </div>
        </div>
      )}
    </div>
  )
}
