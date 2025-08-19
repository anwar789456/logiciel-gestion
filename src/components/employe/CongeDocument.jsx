import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';

const CongeDocument = React.forwardRef(({ formData, employeeInfo }, ref) => {
  const { t } = useTranslation();
  const { isDarkMode } = useApp();
  const logoPath = isDarkMode ? '/logo-samet-home-dark-mode.png' : '/logo-samet-home.png';
  
  // Helper function to generate checkbox styles
  const getCheckboxStyle = (isChecked) => ({
    width: '1.25rem', 
    height: '1.25rem', 
    border: '1px solid #9ca3af', 
    marginRight: '0.5rem', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: isChecked ? '#1f2937' : 'white',
    color: isChecked ? 'white' : 'inherit'
  });
  
  // Format date to DD/MM/YYYY - memoized to prevent recalculations
  const formatDate = useMemo(() => {
    return (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
  }, []);

  // Calculate number of days between two dates - memoized to prevent recalculations
  const calculateDays = useMemo(() => {
    return (startDate, endDate) => {
      if (!startDate || !endDate) return '';
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      return diffDays === 1 ? '(1 jour)' : `(${diffDays} jours)`;
    };
  }, []);

  // Memoize the current date to avoid recalculations on each render
  const currentDate = useMemo(() => {
    return formatDate(new Date().toISOString().split('T')[0]);
  }, [formatDate]);
  
  // PDF document styles
  const documentStyles = useMemo(() => ({
    minHeight: '29.7cm',
    width: '100%',
    paddingLeft: '80px',
    paddingRight: '80px',
    paddingTop: '50px',
    paddingBottom: '40px',
    margin: '0',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif'
  }), []);
  
  return (
    <div ref={ref} style={documentStyles}>
      {/* Header with logo and title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img 
          src={logoPath} 
          alt="Samet Home Logo" 
          style={{ height: '80px', margin: '0 auto', marginBottom: '1rem' }}
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem', border: '1px solid black'}}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: '500', display: 'inline-block' }}>Demande de congés</h2>
      </div>

      {/* Employee Information */}
      <div style={{ marginBottom: '2rem', fontSize: '1.6rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600' }}>Nom de l'employé: </span>
          <span>{employeeInfo?.name || 'N/A'}</span>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600' }}>Service: </span>
          <span>{employeeInfo?.department || 'N/A'}</span>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600' }}>Responsable: </span>
          <span>{employeeInfo?.manager || 'N/A'}</span>
        </div>
      </div>

      {/* Motif Section */}
      <div style={{ marginBottom: '2rem', fontSize: '1.6rem' }}>
        <h3 style={{ fontWeight: '400', marginBottom: '1rem' }}>Motif:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.motif === 'Maladie')}>
              {formData.motif === 'Maladie' && 'X'}
            </div>
            <span>Maladie</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.motif === 'Congé')}>
              {formData.motif === 'Congé' && 'X'}
            </div>
            <span>Congé</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.motif === 'Décès')}>
              {formData.motif === 'Décès' && 'X'}
            </div>
            <span>Décès</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.motif === 'Congés sans solde')}>
              {formData.motif === 'Congés sans solde' && 'X'}
            </div>
            <span>Congés sans solde</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.motif === 'Congé maternité')}>
              {formData.motif === 'Congé maternité' && 'X'}
            </div>
            <span>Congé maternité</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.motif === 'Congé parental')}>
              {formData.motif === 'Congé parental' && 'X'}
            </div>
            <span>Congé parental</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.motif === 'Mariage')}>
              {formData.motif === 'Mariage' && 'X'}
            </div>
            <span>Mariage</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.motif === 'Pour évènements familiaux')}>
              {formData.motif === 'Pour évènements familiaux' && 'X'}
            </div>
            <span>Pour évènements familiaux</span>
          </div>
        </div>
        
        {/* Autre motif */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={getCheckboxStyle(formData.motif === 'autre')}>
              {formData.motif === 'autre' && 'X'}
            </div>
            <span>Autres: </span>
          </div>
          {formData.motif === 'autre' && formData.autreMotif && (
            <div style={{ marginLeft: '1.75rem', borderBottom: '1px solid #9ca3af', paddingBottom: '0.25rem' }}>
              {formData.autreMotif}
            </div>
          )}
        </div>
      </div>

      {/* Date Range Section */}
      <div style={{ marginBottom: '2rem', fontSize: '1.6rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          <span style={{ fontWeight: '400' }}>Sollicite un congé: </span>
          du {formatDate(formData.dateRange?.startDate)} au {formatDate(formData.dateRange?.endDate)} {calculateDays(formData.dateRange?.startDate, formData.dateRange?.endDate)}
        </p>
        
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ fontStyle: 'italic', fontWeight: '800', }}>Les demandes de congés doivent être soumises au minimum deux jours avant leur date effective sauf pour les congés maladies.</p>
        </div>
      </div>

      {/* Admin Section */}
      <div style={{ marginBottom: '2rem', fontSize: '1.6rem' }}>
        <h3 style={{ fontWeight: '400', marginBottom: '1rem' }}>Demande de congé effectuée le {formatDate(formData.date_effectuer)}</h3>
      </div>

      {/* Decision Section */}
      <div style={{ marginBottom: '2rem', fontSize: '1.6rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Décision du responsable du service</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.decisionResponsable === 'Accord total')}>
              {formData.decisionResponsable === 'Accord total' && 'X'}
            </div>
            <span>Accord total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.decisionResponsable === 'Accord partiel')}>
              {formData.decisionResponsable === 'Accord partiel' && 'X'}
            </div>
            <span>Accord partiel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={getCheckboxStyle(formData.decisionResponsable === 'Refus')}>
              {formData.decisionResponsable === 'Refus' && 'X'}
            </div>
            <span>Refus</span>
          </div>
        </div>
        
        {/* Display partial date range if applicable */}
         {formData.decisionResponsable === 'Accord partiel' && formData.dateRangePartiel && 
           (formData.dateRangePartiel.startDate || formData.dateRangePartiel.endDate) && (
           <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem',  borderRadius: '0.375rem', backgroundColor: '#ffffff' }}>
             <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Période accordée partiellement:</h4>
             <p>
               du {formatDate(formData.dateRangePartiel.startDate)} au {formatDate(formData.dateRangePartiel.endDate)} {calculateDays(formData.dateRangePartiel.startDate, formData.dateRangePartiel.endDate)}
             </p>
           </div>
         )}
        
      </div>

      {/* Signature Section */}
      <div style={{ display: 'flex', fontSize: '1.6rem', justifyContent: 'space-between', marginTop: '4rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: '500', marginBottom: '3rem' }}>Fait à Ariana le {currentDate}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: '500', marginBottom: '3rem' }}>Signature du responsable du service</p>
        </div>
      </div>
    </div>
  );
});

export default CongeDocument;