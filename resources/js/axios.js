import axios from 'axios';
import swal from 'sweetalert';

const api_url = import.meta.env.VITE_API_URL; // Ensure this is defined in your .env file

const axiosInstance = axios.create({
    baseURL: api_url, // Set the base URL for all requests
});

// Optional: Add interceptors if needed
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // or localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Set the Authorization header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isAlertShown = false;

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (!isAlertShown) {
                isAlertShown = true;
                // Handle unauthorized access, e.g., redirect to login page
                console.error("Unauthorized! Redirecting to login...");
                swal({
                    title: "Session expired! Please login again",
                    text: "  ",
                    icon: "success",
                    buttons: { visible: false },
                    closeOnClickOutside: true,
                    closeOnEsc: true,
                    timer: 3000
                }).then(() => {
                    // After alert closes, reset flag and redirect
                    isAlertShown = false;
                    localStorage.removeItem('token'); // Clear the token
                    window.location.href = '/login'; // Redirect to login page
                });
            }
        }
        return Promise.reject(error.response);
    }
);

export default axiosInstance;
