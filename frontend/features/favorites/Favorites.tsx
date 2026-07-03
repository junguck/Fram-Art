import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Post } from '../../types/post';
import { Heart } from 'lucide-react';
import MasonryGridFav from '../gallery/MasonryGridFav';
import LoadingPage from '../../components/ui/LoadingPage';

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    const loadFavorites = async () => {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.getFavorites();
        const favoritesData = (response.favorites as any[]) || [];
        const mappedFavorites = favoritesData
          .map((fav) => {
            const oeuvre = fav.oeuvre;
            if (!oeuvre) return null;
            return {
              id: oeuvre.id,
              title: oeuvre.title || 'Œuvre favorite',
              imageUrl: oeuvre.imageUrl || '',
              author: {
                id: oeuvre.artiste?.id || oeuvre.author?.id || '',
                name: oeuvre.artiste?.nom_utilisateur || oeuvre.author?.name || 'Artiste',
                avatar: oeuvre.artiste?.url_avatar || oeuvre.author?.avatar || '',
              },
              stats: {
                likes: oeuvre.stats?.likes ?? oeuvre.nb_likes ?? 0,
                views: oeuvre.stats?.views ?? oeuvre.nb_vues ?? 0,
              },
              description: oeuvre.description || '',
            } as Post;
          })
          .filter(Boolean) as Post[];

        if (!canceled) setFavorites(mappedFavorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
        if (!canceled) setFavorites([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    void loadFavorites();
    return () => {
      canceled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-black">
        <div className="bg-white border-4 border-black p-8 rounded-lg shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] text-center">
          <p className="text-xl font-black">Connectez-vous pour voir vos favoris.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-7xl pt-4 flex flex-col min-h-screen bg-[#F8F9FA] text-black">
      {/* En-tête de la page */}
      <div className="px-8 py-6 mb-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="bg-white p-3 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          <Heart size={32} className="text-red-500" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-black">
            Galerie Privée
          </h1>
          <p className="text-sm font-bold text-gray-700 italic">
            Vos {favorites.length} œuvres favorites
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10">
        {loading ? (
          <LoadingPage />
        ) : favorites.length > 0 ? (
          <MasonryGridFav posts={favorites} />
        ) : (
          <div className="bg-white border-4 border-black p-8 rounded-xl text-center font-bold text-gray-800">
            Vous n'avez pas encore ajouté d'œuvres favorites.
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;