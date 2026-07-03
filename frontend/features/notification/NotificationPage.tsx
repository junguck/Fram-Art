import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Heart, MessageSquare, UserPlus } from 'lucide-react';
import { api } from '../../services/api';
import type { Notification } from '../../types/notification';
import LoadingPage from '../../components/ui/LoadingPage';
import { useToast } from '../../context/ToastContext';

const NotificationPage: React.FC = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.getNotifications();
      setNotifications((response.notifications as Notification[]) || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Impossible de charger les notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((items) => items.map((item) => ({ ...item, est_lue: true })));
      showToast('Notifications marquees comme lues.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Action impossible.', 'error');
    }
  };

  const markAsRead = async (notification: Notification) => {
    if (notification.est_lue) return;
    try {
      await api.markNotificationRead(notification._id);
      setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, est_lue: true } : item));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Action impossible.', 'error');
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'nouveau_like':
        return <Heart size={16} className="text-red-500" fill="currentColor" />;
      case 'nouveau_abonne':
        return <UserPlus size={16} className="text-blue-500" />;
      case 'nouveau_commentaire':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'candidature_approuvee':
        return <CheckCircle size={16} className="text-emerald-600" />;
      default:
        return <Bell size={16} />;
    }
  };

  const getText = (notification: Notification) => {
    const meta = notification.meta || {};
    switch (notification.type) {
      case 'nouveau_like':
        return `${meta.auteur_nom || 'Quelqu’un'} a aimé votre oeuvre "${meta.titre_oeuvre || ''}"`;
      case 'nouveau_commentaire':
        return `${meta.auteur_nom || 'Quelqu’un'} a commenté votre oeuvre "${meta.titre_oeuvre || ''}"`;
      case 'nouveau_abonne':
        return `${meta.auteur_nom || meta.abonne_nom || 'Quelqu’un'} a commencé à vous suivre`;
      case 'candidature_approuvee':
        return 'Votre candidature artiste a été approuvée';
      case 'candidature_rejetee':
        return 'Votre candidature artiste a été rejetée';
      case 'candidature_en_examen':
        return 'Votre candidature est en cours d’examen';
      default:
        return meta.message || 'Nouvelle notification';
    }
  };

  const unreadCount = notifications.filter((item) => !item.est_lue).length;

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-3xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black">Notifications</h1>
        <button
          type="button"
          onClick={markAllAsRead}
          className="bg-blue-600 text-white border-2 border-black px-3 py-1 font-black text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700"
        >
          {unreadCount} NOUVELLES
        </button>
      </div>

      <div className="space-y-4 text-black">
        {notifications.length > 0 ? notifications.map((notification) => (
          <button
            type="button"
            key={notification._id}
            onClick={() => markAsRead(notification)}
            className={`w-full text-left flex items-center gap-4 p-4 border-4 border-black transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
              notification.est_lue ? 'bg-blue-100' : 'bg-emerald-100'
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full border-2 border-black bg-white grid place-items-center">
                <Bell size={22} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white border-2 border-black rounded-full p-1">
                {getIcon(notification.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug text-gray-900">{getText(notification)}</p>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                {new Date(notification.cree_le).toLocaleString('fr-FR')}
              </span>
            </div>
          </button>
        )) : (
          <div className="bg-white border-4 border-black p-8 text-center font-bold text-gray-900">
            Aucune notification pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
