/**
 * @file notificationsData.ts
 */
export type NotificationType = 'like' | 'follow' | 'comment' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
  };
  content?: string; // Pour les commentaires
  targetPost?: string; // Image miniature du post concerné
  timestamp: string;
  isRead: boolean;
}

export const VIRTUAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'like',
    user: { name: 'Marc_Art', avatar: 'https://i.pravatar.cc/150?u=marc' },
    targetPost: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab',
    timestamp: 'Il y a 2 min',
    isRead: false
  },
  {
    id: 'n2',
    type: 'follow',
    user: { name: 'Elena_Design', avatar: 'https://i.pravatar.cc/150?u=elena' },
    timestamp: 'Il y a 1 heure',
    isRead: false
  },
  {
    id: 'n3',
    type: 'comment',
    user: { name: 'Kouamé_Poly', avatar: 'https://i.pravatar.cc/150?u=kouame' },
    content: "Le jeu de lumière sur cette frame est incroyable ! 🔥",
    targetPost: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853',
    timestamp: 'Il y a 3 heures',
    isRead: true
  },
  {
    id: 'n4',
    type: 'system',
    user: { name: 'Fram\'Art Team', avatar: '/logo.png' },
    content: "Bienvenue au Niveau 2 ! Votre profil est maintenant vérifié.",
    timestamp: 'Hier',
    isRead: true
  }
];