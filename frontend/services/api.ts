const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const getToken = () => localStorage.getItem('access_token');

const authHeaders = (json = true): HeadersInit => {
  const token = getToken();
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data?.detail)
      ? (data.detail as Array<{ msg?: string }>).map((item) => item?.msg).filter(Boolean).join(', ')
      : data?.detail;
    throw new Error(detail || data?.message || 'Erreur API');
  }
  return data;
};



const dataArray = (response: Record<string, unknown>): unknown[] => (response?.data as unknown[]) ?? [];
const dataObject = (response: Record<string, unknown>): unknown => response?.data ?? null;
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const api = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nom_utilisateur: name, email, password }),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, { headers: authHeaders(false) });
    return handleResponse(response);
  },

  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  applyForArtist: async (_userId: string, motivation: string, url_portfolio: string, oeuvres_exemple_ids: string[] = []) => {
    const response = await fetch(`${API_BASE_URL}/auth/apply-artist`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ motivation, url_portfolio, oeuvres_exemple_ids }),
    });
    return handleResponse(response);
  },

  getMyApplication: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/application/${encodeURIComponent(userId)}`, {
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, { headers: authHeaders(false) });
    const result = await handleResponse(response);
    return { ...result, users: dataArray(result) };
  },

  getProfile: async (username: string) => {
    const isObjectId = /^[a-f\d]{24}$/i.test(username);
    const endpoint = isObjectId ? `/users/${encodeURIComponent(username)}` : `/users/username/${encodeURIComponent(username)}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: authHeaders(false),
    });
    const result = await handleResponse(response);
    return { ...result, user: dataObject(result) };
  },

  updateProfile: async (userId: string, data: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  banUser: async (userId: string, ban: boolean, raison?: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ ban, raison }),
    });
    return handleResponse(response);
  },

  getArtists: async (query = '') => {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    const response = await fetch(`${API_BASE_URL}/artistes${params}`, { headers: authHeaders(false) });
    const result = await handleResponse(response);
    const artists = await Promise.all(
      dataArray(result).map(async (artistValue) => {
        const artist = asRecord(artistValue);
        let stats: Record<string, unknown> = {};
        try {
          const statsResponse = await fetch(`${API_BASE_URL}/artistes/${encodeURIComponent(String(artist._id))}/stats`, {
            headers: authHeaders(false),
          });
          stats = statsResponse.ok ? asRecord(dataObject(await statsResponse.json())) : {};
        } catch {
          stats = {};
        }

        return {
          ...artist,
          utilisateur_id: {
            _id: artist._id,
            nom_utilisateur: artist.nom_utilisateur,
            email: artist.email,
            url_avatar: artist.url_avatar,
          },
          total_vues: stats.total_vues ?? artist.total_vues ?? 0,
          total_likes: stats.total_likes ?? artist.total_likes ?? 0,
          total_abonnes: asRecord(artist.compteurs).abonnes ?? artist.total_abonnes ?? 0,
        };
      })
    );
    return { ...result, artists };
  },

  getArtistStats: async (artistId: string) => {
    const response = await fetch(`${API_BASE_URL}/artistes/${encodeURIComponent(artistId)}/stats`, {
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  revokeArtist: async (artistId: string) => {
    const response = await fetch(`${API_BASE_URL}/artistes/${artistId}/revoke`, {
      method: 'PATCH',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  getPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/oeuvres`, { headers: authHeaders(false) });
    const result = await handleResponse(response);
    return { ...result, posts: dataArray(result) };
  },

  searchOeuvres: async (query: string) => {
    const endpoint = query.trim()
      ? `${API_BASE_URL}/oeuvres/search?q=${encodeURIComponent(query.trim())}`
      : `${API_BASE_URL}/oeuvres`;
    const response = await fetch(endpoint, { headers: authHeaders(false) });
    const result = await handleResponse(response);
    return { ...result, posts: dataArray(result) };
  },

  getPost: async (postId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${postId}`, { headers: authHeaders(false) });
    const result = await handleResponse(response);
    return { ...result, post: dataObject(result) };
  },

  createPost: async (postData: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(postData),
    });
    return handleResponse(response);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_BASE_URL}/oeuvres/upload`, {
      method: 'POST',
      headers: authHeaders(false),
      body: formData,
    });
    return handleResponse(response);
  },

  likePost: async (postId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${postId}/like`, {
      method: 'POST',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  unlikePost: async (postId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${postId}/like`, {
      method: 'DELETE',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  viewPost: async (postId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${postId}/view`, {
      method: 'POST',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  getArtistPosts: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/artiste/${encodeURIComponent(userId)}`, {
      headers: authHeaders(false),
    });
    const result = await handleResponse(response);
    return { ...result, posts: dataArray(result) };
  },

  getApplications: async (query = '') => {
    const response = await fetch(`${API_BASE_URL}/candidatures`, { headers: authHeaders(false) });
    const result = await handleResponse(response);
    const applications = dataArray(result);
    const normalizedQuery = query.trim().toLowerCase();
    return {
      ...result,
      applications: normalizedQuery
        ? applications.filter((item: any) => {
            const haystack = [
              item.motivation,
              item.url_portfolio,
              item.statut,
              typeof item.utilisateur_id === 'object' ? item.utilisateur_id?.nom_utilisateur : item.utilisateur_id,
            ].join(' ').toLowerCase();
            return haystack.includes(normalizedQuery);
          })
        : applications,
    };
  },

  processApplication: async (applicationId: string, approved: boolean, _adminId?: string, decisionMessage?: string) => {
    const endpoint = approved ? 'approve' : 'reject';
    const response = await fetch(`${API_BASE_URL}/candidatures/${applicationId}/${endpoint}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(approved ? { message_decision: decisionMessage } : { message_decision: decisionMessage || 'Candidature rejetee' }),
    });
    return handleResponse(response);
  },

  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, { headers: authHeaders(false) });
    const result = await handleResponse(response);
    return { ...result, notifications: dataArray(result) };
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/mark-read`, {
      method: 'PATCH',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  markAllNotificationsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  deleteNotification: async (notificationId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  getMessages: async () => {
    const response = await fetch(`${API_BASE_URL}/messages`, { headers: authHeaders(false) });
    const result = await handleResponse(response);
    return { ...result, messages: dataArray(result) };
  },

  deleteMessage: async (messageId: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  sendMessage: async (messageData: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(messageData),
    });
    return handleResponse(response);
  },

  getFavorites: async (_userId?: string) => {
    const response = await fetch(`${API_BASE_URL}/favoris`, { headers: authHeaders(false) });
    const result = await handleResponse(response);
    return { ...result, favorites: dataArray(result) };
  },

  addFavorite: async (favoriteDataOrUserId: Record<string, unknown> | string, oeuvreId?: string, collectionNom?: string) => {
    const favoriteData =
      typeof favoriteDataOrUserId === 'string'
        ? { utilisateur_id: favoriteDataOrUserId, oeuvre_id: oeuvreId, collection_nom: collectionNom }
        : favoriteDataOrUserId;
    const response = await fetch(`${API_BASE_URL}/favoris`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(favoriteData),
    });
    return handleResponse(response);
  },

  removeFavorite: async (userIdOrOeuvreId: string, oeuvreId?: string) => {
    const endpoint = oeuvreId
      ? `/favoris/${encodeURIComponent(userIdOrOeuvreId)}/${encodeURIComponent(oeuvreId)}`
      : `/favoris/${encodeURIComponent(userIdOrOeuvreId)}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  reportItem: async (reportData: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/signalements`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(reportData),
    });
    return handleResponse(response);
  },

  createSubscription: async (subscriptionData: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/abonnements`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(subscriptionData),
    });
    return handleResponse(response);
  },

  getSubscriptionsForArtist: async (artistId: string) => {
    const response = await fetch(`${API_BASE_URL}/abonnements/${encodeURIComponent(artistId)}`, {
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  cancelSubscription: async (subscriptionId: string) => {
    const response = await fetch(`${API_BASE_URL}/abonnements/${encodeURIComponent(subscriptionId)}`, {
      method: 'DELETE',
      headers: authHeaders(false),
    });
    return handleResponse(response);
  },

  // Endpoints manquants pour oeuvres
  getOeuvre: async (oeuvreId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${oeuvreId}`, {
      headers: authHeaders(false),
    });
    const result = await handleResponse(response);
    return { ...result, data: dataObject(result) };
  },

  getArtistWorks: async (artistId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/artiste/${artistId}`, {
      headers: authHeaders(false),
    });
    const result = await handleResponse(response);
    return { ...result, data: dataArray(result) };
  },

  likeOeuvre: async (oeuvreId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${oeuvreId}/like`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  unlikeOeuvre: async (oeuvreId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${oeuvreId}/like`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  // Endpoints pour commentaires
  addComment: async (oeuvreId: string, contenu: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${oeuvreId}/commentaires`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ contenu }),
    });
    return handleResponse(response);
  },

  getOeuvreComments: async (oeuvreId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${oeuvreId}/commentaires`, {
      headers: authHeaders(false),
    });
    const result = await handleResponse(response);
    return { ...result, data: dataArray(result) };
  },

  deleteComment: async (oeuvreId: string, commentId: string) => {
    const response = await fetch(`${API_BASE_URL}/oeuvres/${oeuvreId}/commentaires/${commentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  // Endpoints pour artistes
  getArtist: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/artistes/${userId}`, {
      headers: authHeaders(false),
    });
    const result = await handleResponse(response);
    return { ...result, data: dataObject(result) };
  },

  updateArtist: async (userId: string, data: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/artistes/${userId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Endpoints pour suivis
  followArtist: async (artistId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/follow/${artistId}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  unfollowArtist: async (artistId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/follow/${artistId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  // Endpoints pour favoris améliorés
  addFavoriteFull: async (userId: string, oeuvreId: string, collectionNom?: string) => {
    const response = await fetch(`${API_BASE_URL}/favoris`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ utilisateur_id: userId, oeuvre_id: oeuvreId, collection_nom: collectionNom }),
    });
    return handleResponse(response);
  },

  removeFavoriteFull: async (userId: string, oeuvreId: string) => {
    const response = await fetch(`${API_BASE_URL}/favoris/${userId}/${oeuvreId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  // Endpoints pour signalements
  reportPost: async (oeuvreId: string, raison: string, details?: string) => {
    const response = await fetch(`${API_BASE_URL}/signalements`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        cible_type: 'oeuvre',
        cible_id: oeuvreId,
        raison,
        details,
      }),
    });
    return handleResponse(response);
  },


  getSignalements: async () => {
    const response = await fetch(`${API_BASE_URL}/signalements`, {
      headers: authHeaders(),
    });
    const result = await handleResponse(response);
    return { ...result, data: dataArray(result) };
  },

  processSignalement: async (signalementId: string, statut: 'traite' | 'rejete') => {
    const response = await fetch(`${API_BASE_URL}/signalements/${signalementId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ statut }),
    });
    return handleResponse(response);
  },
};
