import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Helper to get role from URL
const getActiveRole = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/staff')) return 'staff';
    if (path.startsWith('/consultant')) return 'consultant';
    if (path.startsWith('/user') || path.startsWith('/book-token')) return 'user';
    return null;
};

// Request interceptor to add specific role token
api.interceptors.request.use(
    (config) => {
        const role = getActiveRole();
        const tokenKey = role ? `${role}_token` : 'token';
        const token = localStorage.getItem(tokenKey) || localStorage.getItem('token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401s per role
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const role = getActiveRole();
            if (role) {
                localStorage.removeItem(`${role}_token`);
                localStorage.removeItem(`${role}_user`);
                window.location.href = `/${role}/login`;
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
