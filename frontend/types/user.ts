// Types utilisateur et artiste pour Frame'Art

export interface User {
  _id: string;
  nom_utilisateur: string;
  email: string;
  mot_de_passe_hash: string;
  url_avatar?: string | null;
  bio?: string;
  role: 'utilisateur' | 'artiste' | 'administrateur';
  est_actif: boolean;
  est_banni: boolean;
  raison_bannissement?: string | null;
  cree_le: string;
  derniere_connexion?: string | null;
  abonnements_ids: string[]; // Artistes suivis
  abonnes_ids: string[]; // Followers
  compteurs: {
    abonnements: number;
    abonnes: number;
    oeuvres: number;
  };
  notifications?: {
    email_nouveaux_likes: boolean;
    email_nouveaux_commentaires: boolean;
    email_nouveaux_abonnes: boolean;
  };
}

export interface Artist {
  _id: string;
  utilisateur_id: string | Pick<User, '_id' | 'nom_utilisateur' | 'email' | 'url_avatar'>;
  url_portfolio?: string;
  specialites: string[];
  verifie_le: string;
  total_vues: number;
  total_likes: number;
  total_favoris: number;
  total_abonnes: number;
  abonnement_payant_actif: boolean;
  tarif_mensuel_euros?: number | null;
}

export interface Candidature {
  _id: string;
  utilisateur_id: string | Pick<User, '_id' | 'nom_utilisateur' | 'email' | 'url_avatar'>;
  motivation: string;
  url_portfolio: string;
  oeuvres_exemple_ids: string[];
  pieces_jointes: Array<{
    nom: string;
    url: string;
    type: string;
  }>;
  statut: 'en_attente' | 'en_examen' | 'approuve' | 'rejete' | 'resoumis';
  soumis_le: string;
  examine_le?: string | null;
  examine_par_id?: string | null;
  historique: Array<{
    statut: string;
    date: string;
    admin_id: string;
    commentaire: string;
  }>;
  note_interne?: string | null;
  message_decision?: string | null;
  nb_resoumissions: number;
}
