import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers, deleteUserById, updateUserById, createUser } from '../../api/user';
import { User, Trash2, Edit, Search, UserPlus, AlertCircle, X, Check, Lock, IdCard, Shield, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEmployeeUser, setIsEmployeeUser] = useState(false);
  
  // Available routes in the application - updated to include hierarchical structure
  // Website routes are grouped under a parent 'website' route
  const availableRoutes = [
    { path: 'dashboard', label: 'Dashboard' },
    { path: 'agenda', label: 'Agenda' },
    { path: 'factures', label: 'Factures' },
    { path: 'commandes-en-cours', label: 'Commandes en cours' },
    { path: 'commandes-fiche', label: 'Historique commandes' },
    { path: 'users', label: 'Liste des utilisateurs' },
    { path: 'employes', label: 'Liste des employés' },
    { path: 'demande-conge', label: 'Demande de congé' },
    { path: 'liste-conge', label: 'Liste des congés' },
    { path: 'clients', label: 'Clients' },
    { path: 'recu-paiement', label: 'Reçu de paiement' },
    { path: 'bon-livraison', label: 'Bon de livraison' },
    { path: 'fournisseur', label: 'Fournisseur' },
    { path: 'devis', label: 'Devis' },
    { path: 'assistant', label: 'Assistant IA' },
    { path: 'caisse', label: 'Caisse' },
    // Parent website route with child routes
    { 
      path: 'website', 
      label: 'Website', 
      isParent: true,
      children: [
        { path: 'products', label: 'Produits', parent: 'website' },
        { path: 'categories', label: 'Catégories', parent: 'website' },
        { path: 'qr-code', label: 'QR Code', parent: 'website' },
        { path: 'carousel', label: 'Carousel', parent: 'website' },
        { path: 'messages', label: 'Messages', parent: 'website' },
      ] 
    },
    { path: 'settings', label: 'Paramètres' },
    { path: 'profile', label: 'Profil' }
  ];
  
  // Flatten routes for easier access when needed
  const flattenedRoutes = availableRoutes.reduce((acc, route) => {
    if (route.isParent && route.children) {
      // Add parent route
      acc.push({ path: route.path, label: route.label, isParent: true });
      // Add all children
      route.children.forEach(child => acc.push(child));
    } else if (!route.parent) {
      // Add regular routes that aren't children
      acc.push(route);
    }
    return acc;
  }, []);
  const [editForm, setEditForm] = useState({
    username: '',
    role: '',
    img_url: '',
    access_routes: []
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    userID: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    img_url: '',
    access_routes: []
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);
  
  // Fetch employees and all employees data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Import the getAllEmployes function at the top of the file
        const { getAllEmployes } = await import('../../api/Employe/Employe');
        const [usersData, employeesData] = await Promise.all([
          getAllUsers(),
          getAllEmployes()
        ]);
        setEmployees(usersData);
        setAllEmployees(employeesData);
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('failed_to_fetch_employees'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [t]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredEmployees = employees.filter(employee => 
    employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEdit = (employee) => {
    setEditingEmployee(employee._id || employee.userID);
    setEditForm({
      username: employee.username,
      role: employee.role,
      img_url: employee.img_url || '',
      access_routes: employee.access_routes || []
    });
    setShowEditModal(true);
  };
  
  const handleAccessPermissions = (employee) => {
    setSelectedEmployee(employee);
    setShowAccessModal(true);
  };
  
  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setShowEditModal(false);
    setEditForm({
      username: '',
      role: '',
      img_url: '',
      access_routes: []
    });
    setEditSuccess(false);
  };
  
  const handleCancelAccess = () => {
    setSelectedEmployee(null);
    setShowAccessModal(false);
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
    if (!editForm.username.trim()) {
      setError(t('please_fill_all_fields'));
      return;
    }
    
    setEditLoading(true);
    try {
      await updateUserById(editingEmployee, editForm);
      
      // Update local state
      setEmployees(prev => 
        prev.map(emp => 
          (emp._id === editingEmployee || emp.userID === editingEmployee) ? { ...emp, ...editForm } : emp
        )
      );
      
      setEditSuccess(true);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        setShowEditModal(false);
        setEditingEmployee(null);
        setEditForm({ username: '', role: '', img_url: '', access_routes: [] });
        setEditSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.response?.data?.message || t('failed_to_update_employee'));
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleUpdateAccess = async () => {
    setError('');
    setEditSuccess(false);
    
    if (!selectedEmployee) return;
    
    setEditLoading(true);
    try {
      // Get the current access_routes from the selected employee
      const updatedEmployee = {
        ...selectedEmployee,
        access_routes: selectedEmployee.access_routes || []
      };
      
      await updateUserById(selectedEmployee._id || selectedEmployee.userID, updatedEmployee);
      
      // Update local state
      setEmployees(prev => 
        prev.map(emp => 
          (emp._id === selectedEmployee._id || emp.userID === selectedEmployee.userID) ? updatedEmployee : emp
        )
      );
      
      setEditSuccess(true);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        setShowAccessModal(false);
        setSelectedEmployee(null);
        setEditSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error updating access permissions:', err);
      setError(err.response?.data?.message || t('failed_to_update_permissions'));
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
      await deleteUserById(id);
      
      // Update local state
      setEmployees(prev => prev.filter(emp => emp._id !== id && emp.userID !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(t('failed_to_delete_employee'));
    }
  };
  
  const handleAddModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isEmployeeUser') {
      setIsEmployeeUser(checked);
      // Reset userID when toggling the checkbox
      setNewEmployee(prev => ({
        ...prev,
        userID: ''
      }));
    } else {
      setNewEmployee(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setAddSuccess(false);
    
    // Validate form
    if (!newEmployee.username.trim() || !newEmployee.password.trim()) {
      setError(t('please_fill_all_fields'));
      return;
    }
    
    if (newEmployee.password !== newEmployee.confirmPassword) {
      setError(t('passwords_do_not_match'));
      return;
    }
    
    setAddLoading(true);
    try {
      // Create new user
      const createdEmployee = await createUser({
        userID: newEmployee.userID,
        username: newEmployee.username,
        password: newEmployee.password,
        role: newEmployee.role,
        img_url: newEmployee.img_url,
        access_routes: newEmployee.access_routes || []
      });
      
      // Update local state
      setEmployees(prev => [...prev, createdEmployee]);
      
      setAddSuccess(true);
      // Reset form
      setNewEmployee({
        userID: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        img_url: '',
        access_routes: []
      });
      setIsEmployeeUser(false); // Reset the employee user checkbox state
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || t('registration_failed'));
    } finally {
      setAddLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 dark:bg-blue-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <User className="mr-2" />
            {t('employee_list')}
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 flex items-center"
          >
            <UserPlus size={18} className="mr-1" />
            {t('add_employee')}
          </button>
        </div>
        
        {error && (
          <div className="m-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        )}
        
        <div className="p-4">
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              autoComplete='off'
              type="text"
              className="p-3 pl-10 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                      {t('username')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('role')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id || employee.userID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                            {employee.img_url ? (
                              <img src={employee.img_url} alt={employee.username} className="h-10 w-10 object-cover" />
                            ) : (
                              <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {employee.username}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {employee.userID || employee._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                          {employee.role === 'admin' ? t('admin') : t('employee')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {confirmDelete === (employee._id || employee.userID) ? (
                          <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => handleDeleteEmployee(employee._id || employee.userID)}
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
                              onClick={() => handleEdit(employee)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title={t('edit_employee')}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleAccessPermissions(employee)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title={t('manage_access_permissions')}
                            >
                              <Shield className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(employee._id || employee.userID)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title={t('delete_employee')}
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
      </div>
      
      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 bg-blue-600 dark:bg-blue-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center">
                <UserPlus className="mr-2" />
                {t('add_employee')}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
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
                    <span className="block sm:inline">{t('employee_registered_successfully')}</span>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <input
                          id="isEmployeeUser"
                          name="isEmployeeUser"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={isEmployeeUser}
                          onChange={handleAddModalChange}
                        />
                        <label htmlFor="isEmployeeUser" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          {t('is_user_employee')}
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                        {t('is_user_employee_explanation')}
                      </p>
                    </div>
                  </div>
                  <label htmlFor="userID" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User ID
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCard className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    {isEmployeeUser ? (
                      <select
                        name="userID"
                        id="userID"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                        value={newEmployee.userID}
                        onChange={handleAddModalChange}
                        required
                      >
                        <option value="">{t('select_employee')}</option>
                        {allEmployees.map(employee => (
                          <option key={employee._id} value={employee._id}>{employee.nom_prenom}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        autoComplete='off'
                        type="text"
                        name="userID"
                        id="userID"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="User ID"
                        value={newEmployee.userID}
                        onChange={handleAddModalChange}
                        required
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('username')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      autoComplete='off'
                      type="text"
                      name="username"
                      id="username"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder={t('enter_username')}
                      value={newEmployee.username}
                      onChange={handleAddModalChange}
                      required
                    />
                  </div>
                </div>
                

                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('password')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      autoComplete='off'
                      type="password"
                      name="password"
                      id="password"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder={t('enter_password')}
                      value={newEmployee.password}
                      onChange={handleAddModalChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('confirm_password')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      autoComplete='off'
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder={t('confirm_password')}
                      value={newEmployee.confirmPassword}
                      onChange={handleAddModalChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('role')}
                  </label>
                  <select
                    name="role"
                    id="role"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    value={newEmployee.role}
                    onChange={handleAddModalChange}
                  >
                    <option value="employee">{t('employee')}</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="img_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('profile_image_url')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      autoComplete='off'
                      type="text"
                      name="img_url"
                      id="img_url"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="https://example.com/image.jpg"
                      value={newEmployee.img_url}
                      onChange={handleAddModalChange}
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addLoading ? t('registering') : t('register')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCancelEdit}>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 bg-blue-600 dark:bg-blue-700 flex justify-between items-center">
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
            
            <div className="p-6">
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
                  <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('username')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      autoComplete='off'
                      type="text"
                      name="username"
                      id="edit-username"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder={t('enter_username')}
                      value={editForm.username}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('role')}
                  </label>
                  <select
                    name="role"
                    id="edit-role"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    value={editForm.role}
                    onChange={handleEditFormChange}
                  >
                    <option value="employee">{t('employee')}</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="edit-img_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('profile_image_url')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      autoComplete='off'
                      type="text"
                      name="img_url"
                      id="edit-img_url"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 px-3 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="https://example.com/image.jpg"
                      value={editForm.img_url}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? t('updating') : t('update')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Access Permissions Modal */}
      {showAccessModal && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={handleCancelAccess}
        >
          <div 
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col animate-fadeIn" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Shield className="mr-2" />
                {t('access_permissions')}
              </h3>
              <button 
                onClick={handleCancelAccess}
                className="text-white/80 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-sm" role="alert">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="block sm:inline">{error}</span>
                  </div>
                </div>
              )}
              
              {editSuccess && (
                <div className="mb-4 bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg shadow-sm" role="alert">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="block sm:inline">{t('permissions_updated_successfully')}</span>
                  </div>
                </div>
              )}
              
              <div className="mb-5">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-500" />
                  {selectedEmployee?.username}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                  {t('configure_route_access')}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="max-h-[350px] overflow-y-auto p-4 space-y-3">
                  {availableRoutes.map((route) => {
                    // Find if this route exists in access_routes array
                    const accessRoute = selectedEmployee?.access_routes?.find(r => 
                      r.access_route === route.path
                    );
                    
                    // For parent routes, check if all children are selected
                    let allChildrenSelected = false;
                    let someChildrenSelected = false;
                    
                    if (route.isParent && route.children) {
                      const childPaths = route.children.map(child => child.path);
                      const selectedChildPaths = selectedEmployee?.access_routes
                        ?.filter(r => childPaths.includes(r.access_route))
                        ?.map(r => r.access_route) || [];
                      
                      allChildrenSelected = selectedChildPaths.length === childPaths.length;
                      someChildrenSelected = selectedChildPaths.length > 0 && selectedChildPaths.length < childPaths.length;
                    }
                    
                    // Skip child routes as they'll be rendered under their parent
                    if (route.parent) return null;
                    
                    return (
                      <div key={route.path} className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                        <div className="flex items-center mb-2">
                          <div className="relative inline-flex items-center">
                            {route.isParent ? (
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">{route.label}</h3>
                            ) : (
                              <>
                                <input
                                  type="checkbox"
                                  id={`route-${route.path}`}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md shadow-sm cursor-pointer"
                                  checked={!!accessRoute}
                                  onChange={() => {
                                    if (!selectedEmployee) return;
                                    
                                    const updatedEmployee = { ...selectedEmployee };
                                    if (!updatedEmployee.access_routes) {
                                      updatedEmployee.access_routes = [];
                                    }
                                    
                                    // Handle regular route selection/deselection
                                    if (accessRoute) {
                                      // Remove this route
                                      updatedEmployee.access_routes = updatedEmployee.access_routes.filter(r => 
                                        r.access_route !== route.path
                                      );
                                    } else {
                                      // Add this route
                                      updatedEmployee.access_routes.push({
                                        access_route: route.path,
                                        access_right: (route.path === 'profile' || route.path === 'settings') ? 'read and write' : 'read only'
                                      });
                                    }
                                    
                                    setSelectedEmployee(updatedEmployee);
                                  }}
                                />
                                <label htmlFor={`route-${route.path}`} className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200 cursor-pointer">
                                  {route.label}
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* For non-parent routes, show access rights */}
                        {!route.isParent && accessRoute && (
                          <div className="ml-7 mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-wrap gap-4">
                              {/* For profile and settings routes, only show read and write option */}
                              {route.path === 'profile' || route.path === 'settings' ? (
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    id={`read-write-${route.path}`}
                                    name={`access-right-${route.path}`}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    checked={true}
                                    readOnly
                                  />
                                  <label htmlFor={`read-write-${route.path}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    {t('read_and_write')}
                                  </label>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`read-only-${route.path}`}
                                      name={`access-right-${route.path}`}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      checked={accessRoute.access_right === 'read only'}
                                      onChange={() => {
                                        if (!selectedEmployee) return;
                                        
                                        const updatedEmployee = { ...selectedEmployee };
                                        const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                          r.access_route === route.path
                                        );
                                        
                                        if (routeIndex !== -1) {
                                          updatedEmployee.access_routes[routeIndex].access_right = 'read only';
                                          setSelectedEmployee(updatedEmployee);
                                        }
                                      }}
                                    />
                                    <label htmlFor={`read-only-${route.path}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                      {t('read_only')}
                                    </label>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`read-write-${route.path}`}
                                      name={`access-right-${route.path}`}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      checked={accessRoute.access_right === 'read and write'}
                                      onChange={() => {
                                        if (!selectedEmployee) return;
                                        
                                        const updatedEmployee = { ...selectedEmployee };
                                        const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                          r.access_route === route.path
                                        );
                                        
                                        if (routeIndex !== -1) {
                                          updatedEmployee.access_routes[routeIndex].access_right = 'read and write';
                                          setSelectedEmployee(updatedEmployee);
                                        }
                                      }}
                                    />
                                    <label htmlFor={`read-write-${route.path}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                      {t('read_and_write')}
                                    </label>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                                    );
                                  } else {
                                    // For profile and settings routes, add with read and write access
                                    // For other routes, add with read only access by default
                                    updatedEmployee.access_routes.push({
                                      access_route: route.path,
                                      access_right: (route.path === 'profile' || route.path === 'settings') ? 'read and write' : 'read only'
                                    });
                                  }
                                }
                                
                                setSelectedEmployee(updatedEmployee);
                              }}
                            />
                            <label htmlFor={`route-${route.path}`} className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200 cursor-pointer">
                              {route.label}
                            </label>
                          </div>
                        </div>
                        
                        {/* Render child routes if this is a parent route */}
                        {route.isParent && route.children && (
                          <div className="ml-7 mt-2 space-y-2">
                            {route.children.map(childRoute => {
                              const childAccessRoute = selectedEmployee?.access_routes?.find(r => 
                                r.access_route === childRoute.path
                              );
                              
                              return (
                                <div key={childRoute.path} className="flex flex-col p-2 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-100 dark:border-gray-700 mb-2">
                                  <div className="relative inline-flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`route-${childRoute.path}`}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md shadow-sm cursor-pointer"
                                      checked={!!childAccessRoute}
                                      onChange={() => {
                                        if (!selectedEmployee) return;
                                        
                                        const updatedEmployee = { ...selectedEmployee };
                                        if (!updatedEmployee.access_routes) {
                                          updatedEmployee.access_routes = [];
                                        }
                                        
                                        if (childAccessRoute) {
                                          // Remove this child route
                                          updatedEmployee.access_routes = updatedEmployee.access_routes.filter(r => 
                                            r.access_route !== childRoute.path
                                          );
                                        } else {
                                          // Add child route with read only access by default
                                          updatedEmployee.access_routes.push({
                                            access_route: childRoute.path,
                                            access_right: (childRoute.path === 'profile' || childRoute.path === 'settings') ? 'read and write' : 'read only'
                                          });
                                        }
                                        
                                        setSelectedEmployee(updatedEmployee);
                                      }}
                                    />
                                    <label htmlFor={`route-${childRoute.path}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                      {childRoute.label}
                                    </label>
                                  </div>
                                  
                                  {/* Show access rights for child routes */}
                                  {childAccessRoute && (
                                    <div className="ml-6 mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                                      <div className="flex flex-wrap gap-4">
                                        {/* For profile and settings routes, only show read and write option */}
                                        {childRoute.path === 'profile' || childRoute.path === 'settings' ? (
                                          <div className="flex items-center">
                                            <input
                                              type="radio"
                                              id={`read-write-${childRoute.path}`}
                                              name={`access-right-${childRoute.path}`}
                                              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                              checked={true}
                                              readOnly
                                            />
                                            <label htmlFor={`read-write-${childRoute.path}`} className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                                              {t('read_and_write')}
                                            </label>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex items-center">
                                              <input
                                                type="radio"
                                                id={`read-only-${childRoute.path}`}
                                                name={`access-right-${childRoute.path}`}
                                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={childAccessRoute.access_right === 'read only'}
                                                onChange={() => {
                                                  if (!selectedEmployee) return;
                                                  
                                                  const updatedEmployee = { ...selectedEmployee };
                                                  const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                                    r.access_route === childRoute.path
                                                  );
                                                  
                                                  if (routeIndex !== -1) {
                                                    updatedEmployee.access_routes[routeIndex].access_right = 'read only';
                                                    setSelectedEmployee(updatedEmployee);
                                                  }
                                                }}
                                              />
                                              <label htmlFor={`read-only-${childRoute.path}`} className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                                                {t('read_only')}
                                              </label>
                                            </div>
                                            <div className="flex items-center">
                                              <input
                                                type="radio"
                                                id={`read-write-${childRoute.path}`}
                                                name={`access-right-${childRoute.path}`}
                                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={childAccessRoute.access_right === 'read and write'}
                                                onChange={() => {
                                                  if (!selectedEmployee) return;
                                                  
                                                  const updatedEmployee = { ...selectedEmployee };
                                                  const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                                    r.access_route === childRoute.path
                                                  );
                                                  
                                                  if (routeIndex !== -1) {
                                                    updatedEmployee.access_routes[routeIndex].access_right = 'read and write';
                                                    setSelectedEmployee(updatedEmployee);
                                                  }
                                                }}
                                              />
                                              <label htmlFor={`read-write-${childRoute.path}`} className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                                                {t('read_and_write')}
                                              </label>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {accessRoute && (
                          <div className="ml-7 mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-wrap gap-4">
                              {/* For profile and settings routes, only show read and write option */}
                              {route.path === 'profile' || route.path === 'settings' ? (
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    id={`read-write-${route.path}`}
                                    name={`access-right-${route.path}`}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    checked={true}
                                    onChange={() => {
                                      if (!selectedEmployee) return;
                                      
                                      const updatedEmployee = { ...selectedEmployee };
                                      const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                        r.access_route === route.path
                                      );
                                      
                                      if (routeIndex !== -1) {
                                        updatedEmployee.access_routes[routeIndex].access_right = 'read and write';
                                        setSelectedEmployee(updatedEmployee);
                                      }
                                    }}
                                  />
                                  <label htmlFor={`read-write-${route.path}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    {t('read_and_write')}
                                  </label>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`read-only-${route.path}`}
                                      name={`access-right-${route.path}`}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      checked={accessRoute.access_right === 'read only'}
                                      onChange={() => {
                                        if (!selectedEmployee) return;
                                        
                                        const updatedEmployee = { ...selectedEmployee };
                                        const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                          r.access_route === route.path
                                        );
                                        
                                        if (routeIndex !== -1) {
                                          updatedEmployee.access_routes[routeIndex].access_right = 'read only';
                                          setSelectedEmployee(updatedEmployee);
                                        }
                                      }}
                                    />
                                    <label htmlFor={`read-only-${route.path}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                      {t('read_only')}
                                    </label>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`read-write-${route.path}`}
                                      name={`access-right-${route.path}`}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      checked={accessRoute.access_right === 'read and write'}
                                      onChange={() => {
                                        if (!selectedEmployee) return;
                                        
                                        const updatedEmployee = { ...selectedEmployee };
                                        const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                          r.access_route === route.path
                                        );
                                        
                                        if (routeIndex !== -1) {
                                          updatedEmployee.access_routes[routeIndex].access_right = 'read and write';
                                          setSelectedEmployee(updatedEmployee);
                                        }
                                      }}
                                    />
                                    <label htmlFor={`read-write-${route.path}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                      {t('read_and_write')}
                                    </label>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Display access type controls for child routes */}
                        {route.isParent && route.children && route.children.map(childRoute => {
                          const childAccessRoute = selectedEmployee?.access_routes?.find(r => 
                            r.access_route === childRoute.path
                          );
                          
                          if (!childAccessRoute) return null;
                          
                          return (
                            <div key={`access-type-${childRoute.path}`} className="ml-14 mt-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-100 dark:border-gray-700">
                              <div className="flex flex-wrap gap-2">
                                {/* For profile and settings routes, only show read and write option */}
                                {childRoute.path === 'profile' || childRoute.path === 'settings' ? (
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`read-write-${childRoute.path}`}
                                      name={`access-right-${childRoute.path}`}
                                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      checked={true}
                                      onChange={() => {
                                        if (!selectedEmployee) return;
                                        
                                        const updatedEmployee = { ...selectedEmployee };
                                        const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                          r.access_route === childRoute.path
                                        );
                                        
                                        if (routeIndex !== -1) {
                                          updatedEmployee.access_routes[routeIndex].access_right = 'read and write';
                                          setSelectedEmployee(updatedEmployee);
                                        }
                                      }}
                                    />
                                    <label htmlFor={`read-write-${childRoute.path}`} className="ml-1 block text-xs text-gray-700 dark:text-gray-300">
                                      {t('read_and_write')}
                                    </label>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`read-only-${childRoute.path}`}
                                        name={`access-right-${childRoute.path}`}
                                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        checked={childAccessRoute.access_right === 'read only'}
                                        onChange={() => {
                                          if (!selectedEmployee) return;
                                          
                                          const updatedEmployee = { ...selectedEmployee };
                                          const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                            r.access_route === childRoute.path
                                          );
                                          
                                          if (routeIndex !== -1) {
                                            updatedEmployee.access_routes[routeIndex].access_right = 'read only';
                                            setSelectedEmployee(updatedEmployee);
                                          }
                                        }}
                                      />
                                      <label htmlFor={`read-only-${childRoute.path}`} className="ml-1 block text-xs text-gray-700 dark:text-gray-300">
                                        {t('read_only')}
                                      </label>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`read-write-${childRoute.path}`}
                                        name={`access-right-${childRoute.path}`}
                                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        checked={childAccessRoute.access_right === 'read and write'}
                                        onChange={() => {
                                          if (!selectedEmployee) return;
                                          
                                          const updatedEmployee = { ...selectedEmployee };
                                          const routeIndex = updatedEmployee.access_routes.findIndex(r => 
                                            r.access_route === childRoute.path
                                          );
                                          
                                          if (routeIndex !== -1) {
                                            updatedEmployee.access_routes[routeIndex].access_right = 'read and write';
                                            setSelectedEmployee(updatedEmployee);
                                          }
                                        }}
                                      />
                                      <label htmlFor={`read-write-${childRoute.path}`} className="ml-1 block text-xs text-gray-700 dark:text-gray-300">
                                        {t('read_and_write')}
                                      </label>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelAccess}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleUpdateAccess}
                  disabled={editLoading}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {editLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('saving')}
                    </div>
                  ) : t('save_changes')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;