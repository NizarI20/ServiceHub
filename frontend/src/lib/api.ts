import axios from 'axios';

// Définir l'URL de base en fonction de l'environnement
const getBaseUrl = () => {
  // URL par défaut pour le développement local
  const defaultUrl = 'http://localhost:3000/api';
  
  // Pour le déploiement en production, on pourrait utiliser une variable d'environnement
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || defaultUrl;
  }
  
  return defaultUrl;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Ajouter un timeout pour éviter les requêtes qui restent en attente indéfiniment
  timeout: 15000,
});

// Add a request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  
  if (token) {
    console.log('Token found, adding to request headers');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No token found in localStorage for authenticated request');
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.method?.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error Response:', error.config?.method?.toUpperCase(), error.config?.url);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    // Logs supplémentaires pour aider au débogage
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      console.error('Full error response:', error.response);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('No response received. Network issue or backend server down.');
      console.error('Request details:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Error during request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
