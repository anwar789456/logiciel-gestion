import React from 'react';
import { useTranslation } from 'react-i18next';

const CongeDocument = React.forwardRef(({ formData, employeeInfo }, ref) => {
  const { t } = useTranslation();
  
  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Calculate number of days between two dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays === 1 ? '(1 jour)' : `(${diffDays} jours)`;
  };

  return (
    <div ref={ref} className="bg-white p-8 max-w-[21cm] mx-auto" style={{ minHeight: '29.7cm' }}>
      {/* Header with logo and title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">SAMET HOME</h1>
        <p className="text-sm text-gray-600">MEUBLES ET DÉCORATION</p>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 inline-block">Demande de congés</h2>
      </div>

      {/* Employee Information */}
      <div className="mb-8">
        <div className="mb-2">
          <span className="font-semibold">Nom de l'employé: </span>
          <span>{employeeInfo?.name || 'N/A'}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Service: </span>
          <span>{employeeInfo?.department || 'N/A'}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Responsable: </span>
          <span>{employeeInfo?.manager || 'N/A'}</span>
        </div>
      </div>

      {/* Motif Section */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4">Motif:</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.motif === 'Maladie' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.motif === 'Maladie' && 'X'}
            </div>
            <span>Maladie</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.motif === 'Congé' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.motif === 'Congé' && 'X'}
            </div>
            <span>Congé</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.motif === 'Décès' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.motif === 'Décès' && 'X'}
            </div>
            <span>Décès</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.motif === 'Congés sans solde' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.motif === 'Congés sans solde' && 'X'}
            </div>
            <span>Congés sans solde</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.motif === 'Congé maternité' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.motif === 'Congé maternité' && 'X'}
            </div>
            <span>Congé maternité</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.motif === 'Congé parental' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.motif === 'Congé parental' && 'X'}
            </div>
            <span>Congé parental</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.motif === 'Mariage' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.motif === 'Mariage' && 'X'}
            </div>
            <span>Mariage</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.motif === 'Pour évènements familiaux' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.motif === 'Pour évènements familiaux' && 'X'}
            </div>
            <span>Pour évènements familiaux</span>
          </div>
        </div>
        
        {/* Autre motif */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.motif === 'autre' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.motif === 'autre' && 'X'}
            </div>
            <span>Autres: </span>
          </div>
          {formData.motif === 'autre' && formData.autreMotif && (
            <div className="ml-7 border-b border-gray-400 pb-1">
              {formData.autreMotif}
            </div>
          )}
        </div>
      </div>

      {/* Date Range Section */}
      <div className="mb-8">
        <p className="mb-4">
          <span className="font-semibold">Sollicite un congé: </span>
          du {formatDate(formData.dateDebut)} au {formatDate(formData.dateFin)} {calculateDays(formData.dateDebut, formData.dateFin)}
        </p>
        
        <div className="mt-6 text-sm">
          <p className="italic">Les demandes de congés doivent être soumises au minimum deux jours avant leur date effective sauf pour les congés maladies.</p>
        </div>
      </div>

      {/* Admin Section */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4">Demande de congé effectuée le {formatDate(formData.dateEffectuerConge || new Date().toISOString().split('T')[0])}</h3>
      </div>

      {/* Decision Section */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4">Décision du responsable du service</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.decisionResponsable === 'Accord total' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.decisionResponsable === 'Accord total' && 'X'}
            </div>
            <span>Accord total</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.decisionResponsable === 'Accord partiel' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.decisionResponsable === 'Accord partiel' && 'X'}
            </div>
            <span>Accord partiel</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 flex items-center justify-center ${formData.decisionResponsable === 'Refus' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {formData.decisionResponsable === 'Refus' && 'X'}
            </div>
            <span>Refus</span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between mt-16">
        <div className="text-center">
          <p className="font-semibold mb-12">Signature du responsable du service</p>
          <div className="border-t border-gray-400 w-40 mx-auto"></div>
        </div>
        <div className="text-center">
          <p className="font-semibold mb-12">Fait à Ariana le {formatDate(new Date().toISOString().split('T')[0])}</p>
          <div className="border-t border-gray-400 w-40 mx-auto"></div>
        </div>
      </div>
    </div>
  );
});

export default CongeDocument;