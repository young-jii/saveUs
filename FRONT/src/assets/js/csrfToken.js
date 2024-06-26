import axios from 'axios';

const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'https://jiyoung.pythonanywhere.com';

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

export const getCsrfToken = async () => {
    try {
        const response = await axios.get(`${apiBaseUrl}/api/set-csrf-token/`, { withCredentials: true });
        console.log('CSRF token received:', response.data);
        return response.data.csrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        throw error;
    }
};