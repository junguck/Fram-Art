/**
 * @file post.ts
 * @description Définition des types pour les œuvres d'art (oeuvres).
 */

export interface Like {
  utilisateur_id: string;
  cree_le: string;
}

export interface Reponse {
  _id: string;
  utilisateur_id: string;
  contenu: string;
  cree_le: string;
}

export interface Commentaire {
  _id: string;
  utilisateur_id: string;
  contenu: string;
  est_signale: boolean;
  cree_le: string;
  reponses?: Reponse[];
}

export interface Oeuvre {
  _id: string;
  artiste_id: string;
  titre: string;
  description?: string | null;
  url_image: string;
  urls_images_galerie: string[];
  tags: string[];
  categorie?: string | null;
  est_publiee: boolean;
  est_signalee: boolean;
  cree_le: string;
  modifie_le?: string | null;
  nb_vues: number;
  likes: Like[];
  nb_likes: number;
  commentaires: Commentaire[];
  nb_commentaires: number;
}

// Type pour les réponses API
export interface Post {
  id: string;
  title: string;
  imageUrl: string;
  author: {
    id?: string;
    name: string;
    avatar?: string;
  };
  stats: {
    likes: number;
    views: number;
  };
  description?: string;
}
