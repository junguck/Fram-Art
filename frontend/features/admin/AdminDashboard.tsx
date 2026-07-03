import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { User, Candidature } from '../../types/user';
import type { Notification, Signalement } from '../../types/notification';
import type { Oeuvre } from '../../types/post';
import {
  Users,
  FileText,
  AlertCircle,
  BarChart3,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Bell,
  MessageSquare,
} from 'lucide-react';
import LoadingPage from '../../components/ui/LoadingPage';
import { Navigate, useNavigate } from 'react-router-dom';

type AdminTab = 'overview' | 'users' | 'candidatures' | 'signalements' | 'notifications' | 'chat' | 'oeuvres';

type Message = {
  _id: string;
  expediteur_id: string;
  destinataire_id: string;
  contenu: string;
  est_lu: boolean;
  envoye_le: string;
  type: string;
  thread_id?: string | null;
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);

  const [searchUsers, setSearchUsers] = useState('');
  const [searchCandidatures, setSearchCandidatures] = useState('');
  const [searchNotifications, setSearchNotifications] = useState('');
  const [searchMessages, setSearchMessages] = useState('');
  const [filterCandidatureStatus, setFilterCandidatureStatus] = useState<string>('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, candRes, signRes, oeuRes, notifRes, messagesRes] = await Promise.all([
        api.getUsers(),
        api.getApplications(),
        api.getSignalements(),
        api.getPosts(),
        api.getNotifications(),
        api.getMessages(),
      ]);

      setUsers(usersRes.users || []);
      setCandidatures(candRes.applications || []);
      setSignalements(signRes.data || []);
      setNotifications((notifRes.notifications as Notification[]) || []);
      setMessages((messagesRes.messages as Message[]) || []);
      setOeuvres(oeuRes.posts || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'administrateur') {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center">
          <Lock size={48} className="mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold text-red-900">Accès Refusé</h1>
          <p className="text-red-700 mt-2">Seuls les administrateurs peuvent accéder à cette page</p>
        </div>
      </div>
    );
  }

  // Statistiques
  const stats = {
    totalUsers: users.length,
    artistsCount: users.filter((u) => u.role === 'artiste').length,
    bannedUsers: users.filter((u) => u.est_banni).length,
    pendingApplications: candidatures.filter((c) => c.statut === 'en_attente').length,
    approvedApplications: candidatures.filter((c) => c.statut === 'approuve').length,
    pendingSignalements: signalements.filter((s) => s.statut === 'en_attente').length,
    totalOeuvres: oeuvres.length,
    flaggedOeuvres: oeuvres.filter((o) => o.est_signalee).length,
  };

  // Filtrer les listes
  const filteredUsers = users.filter((u) =>
    u.nom_utilisateur.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredCandidatures = candidatures.filter((c) => {
    const matchSearch =
      (typeof c.utilisateur_id === 'string'
        ? c.utilisateur_id
        : c.utilisateur_id.nom_utilisateur
      )
        .toLowerCase()
        .includes(searchCandidatures.toLowerCase()) ||
      (c.url_portfolio || '').toLowerCase().includes(searchCandidatures.toLowerCase());
    const matchStatus = !filterCandidatureStatus || c.statut === filterCandidatureStatus;
    return matchSearch && matchStatus;
  });

  const filteredNotifications = notifications.filter((notification) => {
    const search = searchNotifications.toLowerCase();
    const meta = notification.meta || {};
    return (
      notification.type.toLowerCase().includes(search) ||
      (meta.message?.toString().toLowerCase() || '').includes(search) ||
      (meta.titre_oeuvre?.toString().toLowerCase() || '').includes(search) ||
      (meta.auteur_nom?.toString().toLowerCase() || '').includes(search)
    );
  });

  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.cree_le).getTime() - new Date(a.cree_le).getTime()
  );

  const filteredMessages = messages.filter((message) => {
    const search = searchMessages.toLowerCase();
    return (
      message.contenu.toLowerCase().includes(search) ||
      message.expediteur_id.toLowerCase().includes(search) ||
      message.destinataire_id.toLowerCase().includes(search) ||
      message.type.toLowerCase().includes(search)
    );
  });

  const getNotificationLabel = (notification: Notification) => {
    const meta = notification.meta || {};
    switch (notification.type) {
      case 'nouveau_like':
        return `${meta.auteur_nom || 'Quelqu’un'} a aimé l’œuvre "${meta.titre_oeuvre || ''}"`;
      case 'nouveau_commentaire':
        return `${meta.auteur_nom || 'Quelqu’un'} a commenté l’œuvre "${meta.titre_oeuvre || ''}"`;
      case 'nouveau_abonne':
        return `${meta.auteur_nom || 'Quelqu’un'} a commencé à vous suivre`;
      case 'candidature_approuvee':
        return 'Candidature approuvée';
      case 'candidature_rejetee':
        return 'Candidature rejetée';
      case 'candidature_en_examen':
        return 'Candidature en cours d’examen';
      case 'oeuvre_signalee':
        return 'Une œuvre a été signalée';
      case 'compte_suspendu':
        return 'Un compte a été suspendu';
      case 'nouveau_message':
        return `${meta.auteur_nom || 'Quelqu’un'} vous a envoyé un message`;
      default:
        return meta.message || 'Nouvelle notification';
    }
  };

  const handleApproveCandidature = async (candidatureId: string) => {
    try {
      await api.processApplication(candidatureId, true, 'Candidature approuvée');
      loadAdminData();
    } catch (error) {
      console.error('Error approving candidature:', error);
    }
  };

  const handleRejectCandidature = async (candidatureId: string) => {
    try {
      await api.processApplication(candidatureId, false, '', 'Candidature rejetée');
      loadAdminData();
    } catch (error) {
      console.error('Error rejecting candidature:', error);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const user = users.find((u) => u._id === userId);
      await api.banUser(userId, !user?.est_banni, 'Utilisateur banni par l\'admin');
      loadAdminData();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleProcessSignalement = async (signalementId: string, approve: boolean) => {
    try {
      await api.processSignalement(signalementId, approve ? 'traite' : 'rejete');
      loadAdminData();
    } catch (error) {
      console.error('Error processing signalement:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Supprimer définitivement ce message ?')) return;
    try {
      await api.deleteMessage(messageId);
      loadAdminData();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleDeleteOeuvre = async (_oeuvreId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette œuvre?')) {
      try {
        // À implémenter lors du backend
        alert('Suppression non disponible pour le moment');
        // await api.deleteOeuvre(oeuvreId);
        // loadAdminData();
      } catch (error) {
        console.error('Error deleting oeuvre:', error);
      }
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase italic mb-2">Dashboard Administrateur</h1>
          <p className="text-gray-900">Gestion des utilisateurs, artistes, candidatures et signalements</p>
        </div>

        {/* Onglets */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { id: 'overview' as const, label: 'Aperçu', icon: BarChart3 },
            { id: 'users' as const, label: 'Utilisateurs', icon: Users },
            { id: 'candidatures' as const, label: 'Candidatures', icon: FileText },
            { id: 'signalements' as const, label: 'Signalements', icon: AlertCircle },
            { id: 'notifications' as const, label: 'Notifications', icon: Bell },
            { id: 'chat' as const, label: 'Chats', icon: MessageSquare },
            { id: 'oeuvres' as const, label: 'Œuvres', icon: Eye },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${
                activeTab === id
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}

        {/* APERÇU */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Utilisateurs Total', value: stats.totalUsers, color: 'blue' },
              { label: 'Artistes', value: stats.artistsCount, color: 'green' },
              { label: 'Utilisateurs Bannis', value: stats.bannedUsers, color: 'red' },
              { label: 'Notifications non lues', value: notifications.filter((n) => !n.est_lue).length, color: 'purple' },
              { label: 'Messages', value: messages.length, color: 'cyan' },
              { label: 'Candidatures en Attente', value: stats.pendingApplications, color: 'yellow' },
              { label: 'Total Œuvres', value: stats.totalOeuvres, color: 'purple' },
              { label: 'Œuvres Signalées', value: stats.flaggedOeuvres, color: 'red' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* UTILISATEURS */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Gestion des Utilisateurs</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Nom</th>
                    <th className="px-4 py-3 text-left font-bold">Email</th>
                    <th className="px-4 py-3 text-left font-bold">Rôle</th>
                    <th className="px-4 py-3 text-left font-bold">Statut</th>
                    <th className="px-4 py-3 text-left font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 btn mx-2.5 bg-blue-600" onClick={()=> navigate(`/profile/${encodeURIComponent(u._id)}`)}>{u.nom_utilisateur}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.est_banni ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
                            Banni
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                            Actif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleBanUser(u._id)}
                          className={`px-3 py-1 rounded text-xs font-bold transition ${
                            u.est_banni
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {u.est_banni ? 'Débannir' : 'Bannir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CANDIDATURES */}
        {activeTab === 'candidatures' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Gestion des Candidatures Artiste</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Rechercher par nom ou portfolio..."
                value={searchCandidatures}
                onChange={(e) => setSearchCandidatures(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterCandidatureStatus}
                onChange={(e) => setFilterCandidatureStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="en_examen">En examen</option>
                <option value="approuve">Approuvée</option>
                <option value="rejete">Rejetée</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredCandidatures.map((cand) => (
                <div key={cand._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">
                        {typeof cand.utilisateur_id === 'string'
                          ? cand.utilisateur_id
                          : cand.utilisateur_id?.nom_utilisateur}
                      </h3>
                      <p className="text-sm text-gray-600">{cand.url_portfolio}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        cand.statut === 'approuve'
                          ? 'bg-green-100 text-green-800'
                          : cand.statut === 'rejete'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {cand.statut}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{cand.motivation.substring(0, 150)}...</p>

                  {cand.statut === 'en_attente' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveCandidature(cand._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRejectCandidature(cand._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIGNALEMENTS */}
        {activeTab === 'signalements' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Gestion des Signalements</h2>

            <div className="space-y-4">
              {signalements.map((sig) => (
                <div key={sig._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm">
                        Type: <span className="text-blue-600">{sig.cible_type}</span>
                      </p>
                      <p className="text-sm text-gray-600">Raison: {sig.raison}</p>
                      {sig.details && <p className="text-sm text-gray-700 mt-1">{sig.details}</p>}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sig.statut === 'traite'
                          ? 'bg-green-100 text-green-800'
                          : sig.statut === 'rejete'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {sig.statut}
                    </span>
                  </div>

                  {sig.statut === 'en_attente' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleProcessSignalement(sig._id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition"
                      >
                        Traiter
                      </button>
                      <button
                        onClick={() => handleProcessSignalement(sig._id, false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-700 transition"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Notifications de la plateforme</h2>
                <p className="text-sm text-gray-600">Voir, rechercher et marquer les notifications.</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await api.markAllNotificationsRead();
                    setNotifications((items) => items.map((item) => ({ ...item, est_lue: true })));
                  } catch (error) {
                    console.error(error);
                  }
                }}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-zinc-900 transition"
              >
                Marquer tout comme lu
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher parmi les notifications..."
                value={searchNotifications}
                onChange={(e) => setSearchNotifications(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-4">
              {sortedNotifications.length > 0 ? (
                sortedNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border border-gray-200 rounded-lg p-4 ${notification.est_lue ? 'bg-blue-100' : 'bg-emerald-100'}`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <p className="font-semibold text-gray-900">{getNotificationLabel(notification)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${notification.est_lue ? 'bg-blue-200 text-blue-900' : 'bg-emerald-200 text-emerald-900'}`}>
                        {notification.est_lue ? 'Lue' : 'Non lue'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{new Date(notification.cree_le).toLocaleString('fr-FR')}</p>
                  </div>
                ))
              ) : (
                <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                  Aucune notification trouvée.
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHATS */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Gestion des chats</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher dans les messages..."
                value={searchMessages}
                onChange={(e) => setSearchMessages(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-4">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <div key={message._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{message.type || 'Direct'}</p>
                        <p className="text-sm text-gray-600">De: {message.expediteur_id} • À: {message.destinataire_id}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
                      >
                        Supprimer
                      </button>
                    </div>
                    <p className="text-gray-700 mb-2">{message.contenu}</p>
                    <p className="text-xs text-gray-500">{new Date(message.envoye_le).toLocaleString('fr-FR')}</p>
                  </div>
                ))
              ) : (
                <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                  Aucun message disponible.
                </div>
              )}
            </div>
          </div>
        )}

        {/* OEUVRES */}
        {activeTab === 'oeuvres' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Gestion des Œuvres</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {oeuvres.map((oeuvre) => (
                <div key={oeuvre._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                  <img
                    src={oeuvre.url_image}
                    alt={oeuvre.titre}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-2">{oeuvre.titre}</h3>
                    {oeuvre.est_signalee && (
                      <div className="mb-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold text-center">
                        Signalée
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mb-3">
                      {oeuvre.nb_vues} vues • {oeuvre.nb_likes} likes
                    </p>
                    <button
                      onClick={() => handleDeleteOeuvre(oeuvre._id)}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
