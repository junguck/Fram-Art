import React from 'react';
import { Heart, MessageCircle, Users, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import type { Notification } from '../../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (notificationId: string) => void;
}

export const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'nouveau_like':
        return <Heart size={20} className="text-red-500" />;
      case 'nouveau_commentaire':
        return <MessageCircle size={20} className="text-blue-500" />;
      case 'nouveau_abonne':
        return <Users size={20} className="text-green-500" />;
      case 'candidature_approuvee':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'candidature_rejetee':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'candidature_en_examen':
        return <Bell size={20} className="text-yellow-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getMessage = () => {
    const meta = notification.meta;
    switch (notification.type) {
      case 'nouveau_like':
        return `${meta.auteur_nom} a aimé votre œuvre "${meta.titre_oeuvre}"`;
      case 'nouveau_commentaire':
        return `${meta.auteur_nom} a commenté votre œuvre "${meta.titre_oeuvre}"`;
      case 'nouveau_abonne':
        return `${meta.auteur_nom} s'est abonné à votre profil`;
      case 'candidature_approuvee':
        return 'Félicitations! Votre candidature artiste a été approuvée';
      case 'candidature_rejetee':
        return 'Votre candidature artiste a été examinée';
      case 'candidature_en_examen':
        return 'Votre candidature est en cours d\'examen';
      default:
        return 'Nouvelle notification';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `il y a ${minutes}m`;
    if (hours < 24) return `il y a ${hours}h`;
    if (days < 7) return `il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div
      className={`p-4 border-l-4 flex gap-4 hover:bg-gray-50 transition cursor-pointer ${
        notification.est_lue
          ? 'border-gray-300 bg-white'
          : 'border-blue-500 bg-blue-50'
      }`}
      onClick={() => onMarkAsRead?.(notification._id)}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{getMessage()}</p>
        <p className="text-xs text-gray-500 mt-1">{formatDate(notification.cree_le)}</p>
      </div>
      {!notification.est_lue && (
        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
      )}
    </div>
  );
};

// Composant pour afficher une liste complète de notifications
interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.est_lue).length;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-sm text-gray-600">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Liste des notifications */}
      <div className="divide-y divide-gray-200">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItemComponent
              key={notification._id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell size={40} className="mx-auto mb-3 text-gray-300" />
            <p>Aucune notification pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
};
