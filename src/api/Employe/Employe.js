import axios from 'axios';

const API_BASE_URL_GET    = 'https://www.samethome.com/admin/api/logiciel/get-all-employees';
const API_BASE_URL_ADD    = 'https://www.samethome.com/admin/api/logiciel/create-employees';
const API_BASE_URL_UPDATE = 'https://www.samethome.com/admin/api/logiciel/employees/update-employee/';
const API_BASE_URL_DEL    = 'https://www.samethome.com/admin/api/logiciel/employees/delete-employee/';


export const getAllEmployes = async () => {
    try {
        const response = await axios.get(API_BASE_URL_GET);
        return response.data;
    } catch (error) {
        console.error('Error fetching employes:', error);
        throw error;
    }
};

export const addEmploye = async (employe) => {
    try {
        const response = await axios.post(API_BASE_URL_ADD, employe);
        return response.data;
    } catch (error) {
        console.error('Error adding employee:', error);
        throw error;
    }
};

export const updateEmploye = async (employeId, employe) => {
    try {
        const response = await axios.put(`${API_BASE_URL_UPDATE}${employeId}`, employe);
        return response.data;
    } catch (error) {
        console.error(`Error updating employe with id ${employeId}:`, error);
        throw error;
    }
};

export const deleteEmploye = async (employeId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL_DEL}${employeId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting employe with id ${employeId}:`, error);
        throw error;
    }
};