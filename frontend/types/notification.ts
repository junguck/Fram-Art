export interface Notification {
  _id: string;
  destinataire_id: string;
  type: 'nouveau_like' | 'nouveau_commentaire' | 'nouveau_abonne' | 'candidature_approuvee' | 'candidature_rejetee' | 'candidature_en_examen' | 'oeuvre_signalee' | 'compte_suspendu' | 'nouveau_message';
  meta: {
    oeuvre_id?: string;
    titre_oeuvre?: string;
    auteur_id?: string;
    auteur_nom?: string;
    [key: string]: any;
  };
  est_lue: boolean;
  cree_le: string;
}

export interface Signalement {
  _id: string;
  signaleur_id: string;
  cible_type: 'oeuvre' | 'commentaire' | 'utilisateur';
  cible_id: string;
  raison: 'contenu_inapproprie' | 'droits_auteur' | 'harcèlement' | 'spam' | 'autre';
  details?: string | null;
  statut: 'en_attente' | 'traite' | 'rejete';
  traite_par_id?: string | null;
  traite_le?: string | null;
  cree_le: string;
}
