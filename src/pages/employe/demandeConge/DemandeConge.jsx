import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import { createDemandeConge } from '../../../api/Employe/demandeConge';
import { getAllEmployes } from '../../../api/Employe/Employe';
import { useAuth } from '../../../hooks/useAuth';

export default function DemandeConge() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    motif: '',
    autreMotif: '',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    dateRangePartiel: {
      startDate: null,
      endDate: null
    },
    responsable: '',
    date_effectuer: '',
    decisionResponsable: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState({
    name: '',
    department: '',
    userID: ''
  });
  
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Fetch employee data when component mounts
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (currentUser?.userID) {
        try {
          // Get all employees and filter locally
          const allEmployees = await getAllEmployes();
          
          // Find the employee with matching userID
          const employee = allEmployees.find(emp => emp.userID === currentUser.userID);
          
          if (employee) {
            setEmployeeData(employee);
          } else {
            console.warn(`No employee found with userID: ${currentUser.userID} after fetching all employees and filtering locally.`);
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [currentUser]);
  
  // Set employee info from employee data when it's loaded
  useEffect(() => {
    if (employeeData) {
      setEmployeeInfo({
        name: employeeData?.nom_prenom || '',
        department: employeeData?.nom_post || '',
        userID: currentUser?.userID || ''
      });
    }
  }, [employeeData, currentUser]);

  const motifOptions = [
    { value: 'Maladie', label: t('reason_illness') },
    { value: 'Congé', label: t('reason_leave') },
    { value: 'Décès', label: t('reason_death') },
    { value: 'Congés sans solde', label: t('reason_unpaid_leave') },
    { value: 'Congé maternité', label: t('reason_maternity_leave') },
    { value: 'Congé parental', label: t('reason_parental_leave') },
    { value: 'Mariage', label: t('reason_marriage') },
    { value: 'Pour évènements familiaux', label: t('reason_family_events') },
    { value: 'autre', label: t('reason_other') }
  ];

  // Decision options removed from form but kept for reference
  // const decisionOptions = [
  //   'Accord total',
  //   'Accord partiel',
  //   'Refus'
  // ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested dateRange object
    if (name === 'dateDebut' || name === 'dateFin') {
      const dateField = name === 'dateDebut' ? 'startDate' : 'endDate';
      setFormData(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [dateField]: value
        }
      }));
    } else if (name === 'name' || name === 'department') {
      // Handle employee info fields
      setEmployeeInfo(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      // Prepare data according to the backend schema
      // Note: userID is stored locally but not sent to backend as it's not in the model
      const demandeData = {
        username: employeeInfo.name || currentUser?.username || '',
        job: employeeInfo.department || currentUser?.job || '',
        motif: formData.motif === 'autre' ? formData.autreMotif : formData.motif,
        dateRange: {
          startDate: formData.dateRange.startDate,
          endDate: formData.dateRange.endDate
        },
        dateRangePartiel: {
          startDate: null,
          endDate: null
        },
        responsable: '', // New field - empty by default
        date_effectuer: '', // New field - empty by default
        decisionResponsable: '' // Leave it empty as requested
      };
      
      // Send data to backend
      await createDemandeConge(demandeData);
      
      // Show success message
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        motif: '',
        autreMotif: '',
        dateRange: {
          startDate: '',
          endDate: ''
        },
        dateRangePartiel: {
          startDate: null,
          endDate: null
        },
        responsable: '',
        date_effectuer: '',
        decisionResponsable: ''
      });
    } catch (error) {
      console.error('Error submitting demande de congé:', error);
      setSubmitError(t('failed_to_submit_request'));
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleNewRequest = () => {
    setSubmitSuccess(false);
  };

  return (
    <div className='mt-4 px-8'>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">{t('leave_request_title')}</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : submitSuccess ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">{t('request_submitted_success')}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('request_submitted_message')}
            </p>
            <div className="mt-6">
              <button
                onClick={handleNewRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
              >
                {t('new_request')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('full_name_label')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={employeeInfo.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('department_label')}
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={employeeInfo.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
          {/* Motif */}
          <div className="space-y-4">
            <div>
              <label htmlFor="motif" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reason_label')}</label>
              <select
                id="motif"
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="" disabled>{t('select_reason')}</option>
                {motifOptions.map((option, index) => (
                  <option key={index} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {/* Conditional input field for 'autre' */}
            {formData.motif === 'autre' && (
              <div>
                <label htmlFor="autreMotif" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('specify_reason')}</label>
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
          <div className='flex'>
            <TriangleAlert className="mt-1 w-4 h-4 mr-2 text-yellow-500" />
            <p className='text-gray-500'>{t('leave_notice')}</p>
          </div>

          {/* Sollicite un congé (date range) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('request_leave_from')}</label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateRange.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('request_leave_to')}</label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                value={formData.dateRange.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Removed date effectuer conge field as it's not in the new schema */}

          {/* Decision du responsable du service field removed as requested */}

          {/* Error message */}
          {submitError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {submitError}
            </div>
          )}
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 ${submitting ? 'opacity-70' : ''}`}
            >
              {submitting ? t('submitting') : t('submit_request')}
            </button>
          </div>
          </form>
        </div>
      )}
    </div>
  )
}