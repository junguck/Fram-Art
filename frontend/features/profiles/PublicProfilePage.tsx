import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { User, Artist } from '../../types/user';
import type { Oeuvre } from '../../types/post';
import { Heart, MessageCircle, MoreHorizontal, UserPlus, UserCheck } from 'lucide-react';
import LoadingPage from '../../components/ui/LoadingPage';

const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<User | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      // Récupérer le profil utilisateur
      const profileResponse = await api.getProfile(username);
      setProfile(profileResponse.data);

      // Si c'est un artiste, récupérer ses infos artiste
      if (profileResponse.data?.role === 'artiste') {
        try {
          const artistResponse = await api.getArtist(profileResponse.data._id);
          setArtist(artistResponse.data);
        } catch (error) {
          console.error('Error loading artist info:', error);
        }
      }

      // Récupérer les œuvres
      try {
        const worksResponse = await api.getArtistWorks(profileResponse.data._id);
        setOeuvres(worksResponse.data || []);
      } catch (error) {
        console.error('Error loading works:', error);
      }

      // Vérifier si on suit cet utilisateur
      if (currentUser && currentUser._id !== profileResponse.data._id) {
        setIsFollowing(currentUser.abonnements_ids?.includes(profileResponse.data._id) || false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const displayName = decodeURIComponent(username);
      setProfile({
        _id: displayName,
        nom_utilisateur: displayName,
        email: '',
        mot_de_passe_hash: '',
        role: 'artiste',
        est_actif: true,
        est_banni: false,
        cree_le: new Date().toISOString(),
        abonnements_ids: [],
        abonnes_ids: [],
        compteurs: {
          abonnements: 0,
          abonnes: 0,
          oeuvres: 0,
        },
        bio: "Prototype de profil artiste. Les oeuvres, la bio et les statistiques s'afficheront ici des que ce profil existe dans la base.",
        url_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111827&color=ffffff`,
      });
      setArtist(null);
      setOeuvres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || !currentUser) return;
    try {
      await api.followArtist(profile._id);
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following artist:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!profile || !currentUser) return;
    try {
      await api.unfollowArtist(profile._id);
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing artist:', error);
    }
  };

  if (loading) return <LoadingPage />;
  if (!profile) return <div className="flex items-center justify-center h-screen">Profil introuvable</div>;

  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900">
      {/* En-tête du profil */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-6 flex-1">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={profile.url_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nom_utilisateur)}&background=111827&color=ffffff`}
                  alt={profile.nom_utilisateur}
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                />
              </div>

              {/* Info utilisateur */}
              <div className="flex-1">
                <h1 className="text-3xl font-black uppercase italic">{profile.nom_utilisateur}</h1>
                {artist && (
                  <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    Artiste Vérifié
                  </div>
                )}
                <p className="text-gray-600 mt-3 max-w-2xl">{profile.bio}</p>

                {/* Stats */}
                <div className="flex gap-8 mt-6 text-emerald-900">
                  <div>
                    <div className="text-2xl font-bold">{profile.compteurs?.oeuvres || 0}</div>
                    <div className="text-sm text-gray-600">Œuvres</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{profile.abonnes_ids?.length || 0}</div>
                    <div className="text-sm text-gray-600">Abonnés</div>
                  </div>
                  {artist && (
                    <>
                      <div>
                        <div className="text-2xl font-bold">{artist.total_vues}</div>
                        <div className="text-sm text-gray-600">Vues</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{artist.total_likes}</div>
                        <div className="text-sm text-gray-600">J'aime</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 mt-6">
                  {!isOwnProfile && currentUser && (
                    <>
                      {isFollowing ? (
                        <button
                          onClick={handleUnfollow}
                          className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-blue-500 transition flex items-center gap-2"
                        >
                          <UserCheck size={18} />
                          Abonné
                        </button>
                      ) : (
                        <button
                          onClick={handleFollow}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <UserPlus size={18} />
                          S'abonner
                        </button>
                      )}
                    </>
                  )}

                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/editProfile')}
                      className="px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition"
                    >
                      Modifier le profil
                    </button>
                  )}

                  {profile.role === 'artiste' && artist?.url_portfolio && (
                    <a
                      href={artist.url_portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-500 transition"
                    >
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Menu options (pour admin) */}
            {currentUser?.role === 'administrateur' && !isOwnProfile && (
              <button className="p-2 hover:bg-gray-200 rounded-full transition">
                <MoreHorizontal size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Galerie des œuvres */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-2xl font-black uppercase italic">Galerie</h2>
          <div className="flex-1 h-1 bg-black"></div>
          <span className="font-bold text-sm italic">{oeuvres.length} ITEMS</span>
        </div>

        {oeuvres.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {oeuvres.map((oeuvre) => (
              <div
                key={oeuvre._id}
                onClick={() => navigate(`/post/${oeuvre._id}`)}
                className="cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-square">
                  <img
                    src={oeuvre.url_image}
                    alt={oeuvre.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center text-white">
                      <Heart size={24} />
                      <span className="text-sm font-semibold">{oeuvre.nb_likes}</span>
                    </div>
                    <div className="flex flex-col items-center text-white">
                      <MessageCircle size={24} />
                      <span className="text-sm font-semibold">{oeuvre.nb_commentaires}</span>
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 truncate">{oeuvre.titre}</h3>
                <p className="text-xs text-gray-600">{oeuvre.nb_vues} vues</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Aucune œuvre publiée pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
