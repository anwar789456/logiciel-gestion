import axios from "axios";


const API_BASE_URL_GET = 'https://www.samethome.com/admin/api/logiciel/get-all-agenda-events';
const API_BASE_URL_ADD = 'https://www.samethome.com/admin/api/logiciel/create-agenda-event';
const API_BASE_URL_DEL = 'https://www.samethome.com/admin/api/logiciel/delete-agenda-event/';
const API_BASE_URL_UPD = 'https://www.samethome.com/admin/api/logiciel/update-agenda-event/';


// Get all agenda events
export const getAllAgendaEvents = async () => {
    try {
        const response = await axios.get(API_BASE_URL_GET);
        return response.data;
    } catch (error) {
        console.error('Error fetching agenda events:', error);
        throw error;
    }
};

// Add an agenda event
export const addAgendaEvent = async (eventData) => {
    try {
        const response = await axios.post(API_BASE_URL_ADD, eventData);
        return response.data;
    } catch (error) {
        console.error('Error adding agenda event:', error);
        throw error;
    }
};

// Update an agenda event
export const updateAgendaEvent = async (eventId, eventData) => {
    try {
        const response = await axios.put(`${API_BASE_URL_UPD}${eventId}`, eventData);
        return response.data;
    } catch (error) {
        console.error(`Error updating agenda event with ID ${eventId}:`, error);
        throw error;
    }
};

// Delete an agenda event
export const deleteAgendaEvent = async (eventId) => {
    try {
        const url = `${API_BASE_URL_DEL}${eventId}`;
        console.log(`Sending delete request to: ${url}`);
        
        // Use axios with explicit configuration
        const response = await axios({
            method: 'DELETE',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Delete response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Error deleting agenda event with ID ${eventId}:`, error);
        throw error;
    }
};