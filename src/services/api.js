import axios from 'axios';
import { API_URL } from '@/constants';

/** Instance Axios centralisée avec injection automatique du JWT. */
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Ajoute le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Pour les uploads (FormData), laisser axios définir le Content-Type + boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Session invalide/expirée (401) : on nettoie le token et on retourne à l'ACCUEIL,
// jamais vers /login (règle métier : une déconnexion mène toujours au site).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Le garde évite un rechargement inutile quand la déconnexion volontaire a
      // déjà ramené l'utilisateur sur l'accueil (les 401 tardifs sont alors ignorés).
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
