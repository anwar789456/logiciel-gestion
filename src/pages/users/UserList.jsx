import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers, deleteUserById, updateUserById, createUser } from '../../api/user';
import { User, Trash2, Edit, Search, UserPlus, AlertCircle, X, Check, Lock, IdCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    role: '',
    img_url: ''
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
    img_url: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);
  
  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setEmployees(data);
        setError('');
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(t('failed_to_fetch_employees'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
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
      img_url: employee.img_url || ''
    });
    setShowEditModal(true);
  };
  
  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setShowEditModal(false);
    setEditForm({
      username: '',
      role: '',
      img_url: ''
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
        setEditForm({ username: '', role: '', img_url: '' });
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
        img_url: newEmployee.img_url
      });
      
      // Update local state
      setEmployees(prev => [...prev, createdEmployee]);
      
      setAddSuccess(true);
      // Reset form
      setNewEmployee({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        img_url: ''
      });
      
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
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(employee._id || employee.userID)}
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
                  <label htmlFor="userID" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User ID
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCard className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
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
    </div>
  );
};

export default UserList;