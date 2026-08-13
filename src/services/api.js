import axios from 'axios';
import { API_URL } from '@/constants';

/** Instance Axios centralisée avec injection automatique du JWT. */
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Laisse le temps au backend Render (offre gratuite) de se « réveiller » (cold start).
  timeout: 60000,
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response, code } = error;

    // Session invalide/expirée (401) : on nettoie le token et on retourne à l'ACCUEIL,
    // jamais vers /login (règle métier : une déconnexion mène toujours au site).
    if (response?.status === 401) {
      localStorage.removeItem('token');
      // Le garde évite un rechargement inutile quand la déconnexion volontaire a
      // déjà ramené l'utilisateur sur l'accueil (les 401 tardifs sont alors ignorés).
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
      return Promise.reject(error);
    }

    // COLD START Render : la 1re requête après mise en veille échoue (pas de réponse,
    // timeout, ou 502/503/504 pendant le boot). On relance automatiquement quelques
    // fois avec un délai croissant → l'utilisateur ne voit plus « Network Error ».
    const isColdStart =
      !response || code === 'ECONNABORTED' || [502, 503, 504].includes(response.status);
    if (config && isColdStart) {
      config.__retry = (config.__retry || 0) + 1;
      if (config.__retry <= 4) {
        await new Promise((r) => setTimeout(r, 3000 * config.__retry));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
