import React, { useState, useEffect } from 'react'
import { CopyPlus, Search, Edit, Trash2, User, AlertCircle, X, Check, Calendar, Briefcase, FileText, Image, DollarSign, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAllEmployes, addEmploye, updateEmploye, deleteEmploye } from '../../../api/Employe/Employe'
import { getAllUsers } from '../../../api/user'

export default function ListeEmploye() {
    const { t } = useTranslation();
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [addSuccess, setAddSuccess] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [isUserEmployee, setIsUserEmployee] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
    const [newEmployee, setNewEmployee] = useState({
        userID: '',
        nom_prenom: '',
        date_naiss: '',
        date_recrutement: '',
        nom_post: '',
        descriptif_post: '',
        type_contrat: '',
        lien_cv: '',
        image_profil: '',
        remuneration: ''
    });
    
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [editForm, setEditForm] = useState({
        userID: '',
        nom_prenom: '',
        date_naiss: '',
        date_recrutement: '',
        nom_post: '',
        descriptif_post: '',
        type_contrat: '',
        lien_cv: '',
        image_profil: '',
        remuneration: ''
    });
    
    // Fetch employees and users
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [employeesData, usersData] = await Promise.all([
                    getAllEmployes(),
                    getAllUsers()
                ]);
                setEmployees(employeesData);
                setUsers(usersData);
                setError('');
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(t('failed_to_fetch_employees'));
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    
    const filteredEmployees = employees.filter(employee => 
        employee.nom_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.nom_post?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.type_contrat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.userID?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleAddModalChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setError('');
        setAddSuccess(false);
        
        // Validate form
        if (!newEmployee.nom_prenom.trim() || !newEmployee.nom_post.trim()) {
            setError(t('please_fill_all_fields'));
            return;
        }
        
        setAddLoading(true);
        try {
            // Create new employee
            const createdEmployee = await addEmploye(newEmployee);
            
            // Update local state
            setEmployees(prev => [...prev, createdEmployee]);
            
            setAddSuccess(true);
            
            // Reset form after a short delay
            setTimeout(() => {
                setNewEmployee({
                    userID: '',
                    nom_prenom: '',
                    date_naiss: '',
                    date_recrutement: '',
                    nom_post: '',
                    descriptif_post: '',
                    type_contrat: '',
                    lien_cv: '',
                    image_profil: '',
                    remuneration: ''
                });
                setShowAddModal(false);
                setAddSuccess(false);
            }, 1500);
        } catch (err) {
            console.error('Error adding employee:', err);
            setError(err.response?.data?.message || t('failed_to_add_employee'));
        } finally {
            setAddLoading(false);
        }
    };
    
    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setShowDetailsModal(true);
    };
    
    const handleEditEmployee = (employee) => {
        setEditingEmployee(employee._id);
        
        // Check if this employee is linked to a user
        const isUser = users.some(user => user._id === employee.userID);
        setIsUserEmployee(isUser);
        
        setEditForm({
            userID: employee.userID || '',
            nom_prenom: employee.nom_prenom || '',
            date_naiss: employee.date_naiss ? new Date(employee.date_naiss).toISOString().split('T')[0] : '',
            date_recrutement: employee.date_recrutement ? new Date(employee.date_recrutement).toISOString().split('T')[0] : '',
            nom_post: employee.nom_post || '',
            descriptif_post: employee.descriptif_post || '',
            type_contrat: employee.type_contrat || '',
            lien_cv: employee.lien_cv || '',
            image_profil: employee.image_profil || '',
            remuneration: employee.remuneration || ''
        });
        setShowEditModal(true);
    };
    
    const handleCancelEdit = () => {
        setEditingEmployee(null);
        setShowEditModal(false);
        setIsUserEmployee(false);
        setEditForm({
            userID: '',
            nom_prenom: '',
            date_naiss: '',
            date_recrutement: '',
            nom_post: '',
            descriptif_post: '',
            type_contrat: '',
            lien_cv: '',
            image_profil: '',
            remuneration: ''
        });
        setEditSuccess(false);
    };
    
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        setError('');
        setEditSuccess(false);
        
        // Validate form
        if (!editForm.nom_prenom.trim() || !editForm.nom_post.trim()) {
            setError(t('please_fill_all_fields'));
            return;
        }
        
        setEditLoading(true);
        try {
            await updateEmploye(editingEmployee, editForm);
            
            // Update local state
            setEmployees(prev => 
                prev.map(emp => 
                    emp._id === editingEmployee ? { ...emp, ...editForm } : emp
                )
            );
            
            setEditSuccess(true);
            
            // Close modal after a short delay to show success message
            setTimeout(() => {
                setShowEditModal(false);
                setEditingEmployee(null);
                setEditForm({
                    userID: '',
                    nom_prenom: '',
                    date_naiss: '',
                    date_recrutement: '',
                    nom_post: '',
                    descriptif_post: '',
                    type_contrat: '',
                    lien_cv: '',
                    image_profil: '',
                    remuneration: ''
                });
                setEditSuccess(false);
            }, 1500);
        } catch (err) {
            console.error('Error updating employee:', err);
            setError(err.response?.data?.message || t('failed_to_update_employee'));
        } finally {
            setEditLoading(false);
        }
    };
    
    const handleDeleteClick = (id) => {
        setConfirmDelete(id);
    };
    
    const handleCancelDelete = () => {
        setConfirmDelete(null);
    };
    
    const handleDeleteEmployee = async (id) => {
        try {
            await deleteEmploye(id);
            
            // Update local state
            setEmployees(prev => prev.filter(emp => emp._id !== id));
            setConfirmDelete(null);
        } catch (err) {
            console.error('Error deleting employee:', err);
            setError(t('failed_to_delete_employee'));
        }
    };
    
    return (
        <div className="pt-4">
            <div className='pl-8 pb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700'>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        {(t('fiche_employe'))}
                    </h1>
                </div>
                <div className='flex pr-8'>
                    <button 
                        onClick={() => {
                            setIsUserEmployee(false);
                            setShowAddModal(true);
                        }}
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

            <div className=''>
                {/* Main content */}
                <div className="flex-1 p-8">
                    {error && (
                        <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                <span className="block sm:inline">{error}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Search bar */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            autoComplete='off'
                            type="text"
                            className="p-2 pl-10 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder={t('search_employees')}
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {searchTerm ? t('no_employees_found') : t('no_employees')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {t('name')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {t('position')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {t('contract_type')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {t('recruitment_date')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {t('actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                                        {employee.image_profil ? (
                                                            <img src={employee.image_profil} alt={employee.nom_prenom} className="h-10 w-10 object-cover" />
                                                        ) : (
                                                            <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {employee.nom_prenom}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            ID: {employee.userID || employee._id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">{employee.nom_post}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{employee.descriptif_post}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                    {employee.type_contrat}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {employee.date_recrutement ? new Date(employee.date_recrutement).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {confirmDelete === employee._id ? (
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleDeleteEmployee(employee._id)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-2"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelDelete}
                                                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleViewDetails(employee)}
                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditEmployee(employee)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(employee._id)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {/* Add Employee Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
                        <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="px-6 py-4 bg-blue-600 dark:bg-blue-700 flex justify-between items-center sticky top-0 z-10">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <CopyPlus className="mr-2" />
                                    {t('add_employee')}
                                </h3>
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="text-white hover:text-gray-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]" style={{ scrollbarWidth: 'thin' }}>
                                {error && (
                                    <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                                        <div className="flex items-center">
                                            <AlertCircle className="w-5 h-5 mr-2" />
                                            <span className="block sm:inline">{error}</span>
                                        </div>
                                    </div>
                                )}
                                
                                {addSuccess && (
                                    <div className="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded relative" role="alert">
                                        <div className="flex items-center">
                                            <Check className="w-5 h-5 mr-2" />
                                            <span className="block sm:inline">{t('employee_added_successfully')}</span>
                                        </div>
                                    </div>
                                )}
                                
                                <form onSubmit={handleAddEmployee} className="space-y-4">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            
                                            <div className="flex flex-col">
                                                <div className="flex items-center">
                                                    <input
                                                        id="isUserEmployee"
                                                        name="isUserEmployee"
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        checked={isUserEmployee}
                                                        onChange={() => setIsUserEmployee(!isUserEmployee)}
                                                    />
                                                    <label htmlFor="isUserEmployee" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                        {t('is_user')} ?
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                                    {t('is_user_explanation')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <label htmlFor="userID" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                                                User ID
                                            </label>
                                            {isUserEmployee ? (
                                                <select
                                                    name="userID"
                                                    id="userID"
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                    value={newEmployee.userID}
                                                    onChange={handleAddModalChange}
                                                >
                                                    <option value="">{t('select_user')}</option>
                                                    {users.map(user => (
                                                        <option key={user.userID} value={user.userID}>{user.userID}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    autoComplete='off'
                                                    type="text"
                                                    name="userID"
                                                    id="userID"
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                    placeholder="ID"
                                                    value={newEmployee.userID}
                                                    onChange={handleAddModalChange}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="nom_prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('name')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="nom_prenom"
                                                id="nom_prenom"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder={t('full_name')}
                                                value={newEmployee.nom_prenom}
                                                onChange={handleAddModalChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="date_naiss" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {t('birth_date')}
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    autoComplete='off'
                                                    type="date"
                                                    name="date_naiss"
                                                    id="date_naiss"
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                    value={newEmployee.date_naiss}
                                                    onChange={handleAddModalChange}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="date_recrutement" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {t('recruitment_date')}
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    autoComplete='off'
                                                    type="date"
                                                    name="date_recrutement"
                                                    id="date_recrutement"
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                    value={newEmployee.date_recrutement}
                                                    onChange={handleAddModalChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="nom_post" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('position')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="nom_post"
                                                id="nom_post"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder={t('position_name')}
                                                value={newEmployee.nom_post}
                                                onChange={handleAddModalChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="descriptif_post" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('position_description')}
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="descriptif_post"
                                                name="descriptif_post"
                                                rows="3"
                                                className="p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder={t('position_description')}
                                                value={newEmployee.descriptif_post}
                                                onChange={handleAddModalChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="type_contrat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('contract_type')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                list="contract_types"
                                                name="type_contrat"
                                                id="type_contrat"
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                value={newEmployee.type_contrat}
                                                onChange={handleAddModalChange}
                                                placeholder={t('select_or_type_contract_type')}
                                            />
                                            <datalist id="contract_types">
                                                <option value="CDI">CDI</option>
                                                <option value="CDD">CDD</option>
                                                <option value="Stage">Stage</option>
                                                <option value="Freelance">Freelance</option>
                                            </datalist>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="lien_cv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('cv_link')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="lien_cv"
                                                id="lien_cv"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder="https://example.com/cv.pdf"
                                                value={newEmployee.lien_cv}
                                                onChange={handleAddModalChange}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="image_profil" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('profile_image')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Image className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="image_profil"
                                                id="image_profil"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder="https://example.com/image.jpg"
                                                value={newEmployee.image_profil}
                                                onChange={handleAddModalChange}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="remuneration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('salary')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="remuneration"
                                                id="remuneration"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder={t('salary')}
                                                value={newEmployee.remuneration}
                                                onChange={handleAddModalChange}
                                            />
                                        </div>
                                    </div>
                                    
                                </form>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={handleAddEmployee}
                                    disabled={addLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addLoading ? t('adding') : t('add')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Edit Employee Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCancelEdit}>
                        <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="px-6 py-4 bg-blue-600 dark:bg-blue-700 flex justify-between items-center sticky top-0 z-10">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <Edit className="mr-2" />
                                    {t('edit_employee')}
                                </h3>
                                <button 
                                    onClick={handleCancelEdit}
                                    className="text-white hover:text-gray-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]" style={{ scrollbarWidth: 'thin' }}>
                                {error && (
                                    <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                                        <div className="flex items-center">
                                            <AlertCircle className="w-5 h-5 mr-2" />
                                            <span className="block sm:inline">{error}</span>
                                        </div>
                                    </div>
                                )}
                                
                                {editSuccess && (
                                    <div className="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded relative" role="alert">
                                        <div className="flex items-center">
                                            <Check className="w-5 h-5 mr-2" />
                                            <span className="block sm:inline">{t('employee_updated_successfully')}</span>
                                        </div>
                                    </div>
                                )}
                                
                                <form onSubmit={handleUpdateEmployee} className="space-y-4">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <label htmlFor="edit_userID" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                                                User ID
                                            </label>
                                            <div className="flex flex-col">
                                                <div className="flex items-center">
                                                    <input
                                                        id="edit_isUserEmployee"
                                                        name="edit_isUserEmployee"
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        checked={isUserEmployee}
                                                        onChange={() => setIsUserEmployee(!isUserEmployee)}
                                                    />
                                                    <label htmlFor="edit_isUserEmployee" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                        {t('is_user')}
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                                    {t('is_user_explanation')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            {isUserEmployee ? (
                                                <select
                                                    name="userID"
                                                    id="edit_userID"
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                    value={editForm.userID}
                                                    onChange={handleEditFormChange}
                                                >
                                                    <option value="">{t('select_user')}</option>
                                                    {users.map(user => (
                                                        <option key={user.userID} value={user.userID}>{user.username || user.userID}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    autoComplete='off'
                                                    type="text"
                                                    name="userID"
                                                    id="edit_userID"
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                    placeholder="ID"
                                                    value={editForm.userID}
                                                    onChange={handleEditFormChange}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="edit_nom_prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('name')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="nom_prenom"
                                                id="edit_nom_prenom"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder={t('full_name')}
                                                value={editForm.nom_prenom}
                                                onChange={handleEditFormChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="edit_date_naiss" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {t('birth_date')}
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    autoComplete='off'
                                                    type="date"
                                                    name="date_naiss"
                                                    id="edit_date_naiss"
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                    value={editForm.date_naiss}
                                                    onChange={handleEditFormChange}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="edit_date_recrutement" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {t('recruitment_date')}
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    autoComplete='off'
                                                    type="date"
                                                    name="date_recrutement"
                                                    id="edit_date_recrutement"
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                    value={editForm.date_recrutement}
                                                    onChange={handleEditFormChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="edit_nom_post" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('position')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="nom_post"
                                                id="edit_nom_post"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder={t('position_name')}
                                                value={editForm.nom_post}
                                                onChange={handleEditFormChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="edit_descriptif_post" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('position_description')}
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="edit_descriptif_post"
                                                name="descriptif_post"
                                                rows="3"
                                                className="p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder={t('position_description')}
                                                value={editForm.descriptif_post}
                                                onChange={handleEditFormChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="edit_type_contrat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('contract_type')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                list="edit_contract_types"
                                                name="type_contrat"
                                                id="edit_type_contrat"
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-1 border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                value={editForm.type_contrat}
                                                onChange={handleEditFormChange}
                                                placeholder={t('select_or_type_contract_type')}
                                            />
                                            <datalist id="edit_contract_types">
                                                <option value="CDI">CDI</option>
                                                <option value="CDD">CDD</option>
                                                <option value="Stage">Stage</option>
                                                <option value="Freelance">Freelance</option>
                                            </datalist>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="edit_lien_cv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('cv_link')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="lien_cv"
                                                id="edit_lien_cv"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder="https://example.com/cv.pdf"
                                                value={editForm.lien_cv}
                                                onChange={handleEditFormChange}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="edit_image_profil" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('profile_image')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Image className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="image_profil"
                                                id="edit_image_profil"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder="https://example.com/image.jpg"
                                                value={editForm.image_profil}
                                                onChange={handleEditFormChange}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="edit_remuneration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('salary')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                autoComplete='off'
                                                type="text"
                                                name="remuneration"
                                                id="edit_remuneration"
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                                                placeholder={t('salary')}
                                                value={editForm.remuneration}
                                                onChange={handleEditFormChange}
                                            />
                                        </div>
                                    </div>
                                    
                                </form>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={handleUpdateEmployee}
                                    disabled={editLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editLoading ? t('updating') : t('update')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Employee Details Modal */}
                {showDetailsModal && selectedEmployee && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
                        <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="px-6 py-4 bg-blue-600 dark:bg-blue-700 flex justify-between items-center sticky top-0 z-10">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <User className="mr-2" />
                                    {t('employee_details')}
                                </h3>
                                <button 
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-white hover:text-gray-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]" style={{ scrollbarWidth: 'thin' }}>
                                <div className="flex flex-col space-y-6">
                                    {/* Employee Image and Name */}
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                            {selectedEmployee.image_profil ? (
                                                <img src={selectedEmployee.image_profil} alt={selectedEmployee.nom_prenom} className="h-20 w-20 object-cover" />
                                            ) : (
                                                <User className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEmployee.nom_prenom}</h2>
                                            <p className="text-gray-600 dark:text-gray-400">{selectedEmployee.nom_post}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Employee Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('contract_type')}</h3>
                                                <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedEmployee.type_contrat || '-'}</p>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('birth_date')}</h3>
                                                <p className="mt-1 text-base text-gray-900 dark:text-white">
                                                    {selectedEmployee.date_naiss ? new Date(selectedEmployee.date_naiss).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('recruitment_date')}</h3>
                                                <p className="mt-1 text-base text-gray-900 dark:text-white">
                                                    {selectedEmployee.date_recrutement ? new Date(selectedEmployee.date_recrutement).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('salary')}</h3>
                                                <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedEmployee.remuneration || '-'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('position_description')}</h3>
                                                <p className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEmployee.descriptif_post || '-'}</p>
                                            </div>
                                            
                                            {selectedEmployee.lien_cv && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('cv_link')}</h3>
                                                    <a 
                                                        href={selectedEmployee.lien_cv} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="mt-1 text-base text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        {t('view_cv')}
                                                    </a>
                                                </div>
                                            )}
                                            
                                            {selectedEmployee.userID && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</h3>
                                                    <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedEmployee.userID}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 sticky bottom-0 flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleEditEmployee(selectedEmployee);
                                    }}
                                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Edit className="h-4 w-4 inline mr-1" />
                                    {t('edit')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDetailsModal(false)}
                                    className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {t('close')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}