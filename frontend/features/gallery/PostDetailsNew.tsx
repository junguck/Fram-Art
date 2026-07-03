import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Oeuvre, Commentaire } from '../../types/post';
import type { User } from '../../types/user';
import { Heart, Share2, MessageSquare, Send, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingPage from '../../components/ui/LoadingPage';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [oeuvre, setOeuvre] = useState<Oeuvre | null>(null);
  const [artist, setArtist] = useState<User | null>(null);
  const [comments, setComments] = useState<Commentaire[]>([]);
  // Map userId -> User pour afficher nom + avatar dans les commentaires
  const [commentUsers, setCommentUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadCommentUsers = useCallback(async (commentList: Commentaire[]) => {
    // Récupérer les IDs uniques des auteurs de commentaires
    const uniqueIds = [...new Set(commentList.map((c) => c.utilisateur_id))];

    const entries = await Promise.all(
      uniqueIds.map(async (userId) => {
        try {
          const res = await api.getProfile(userId);
          const userData: User = res.data ?? res.user;
          return [userId, userData] as [string, User];
        } catch {
          return null;
        }
      })
    );

    const usersMap: Record<string, User> = {};
    entries.forEach((entry) => {
      if (entry) usersMap[entry[0]] = entry[1];
    });

    setCommentUsers(usersMap);
  }, []);

  const loadOeuvre = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      await api.viewPost(id);

      // Charger l'œuvre
      const oeuvreResponse = await api.getOeuvre(id);
      const oeuvreData: Oeuvre = oeuvreResponse.data;
      setOeuvre(oeuvreData);

      // Charger l'artiste
      const artistResponse = await api.getProfile(oeuvreData.artiste_id);
      setArtist(artistResponse.data ?? artistResponse.user);

      // Charger les commentaires
      const commentsResponse = await api.getOeuvreComments(id);
      const commentList: Commentaire[] = commentsResponse.data || [];
      setComments(commentList);

      // Charger les profils des auteurs de commentaires
      await loadCommentUsers(commentList);

      // Vérifier si l'utilisateur a aimé
      if (user) {
        setIsLiked(
          oeuvreData.likes?.some(
            (l: { utilisateur_id: string }) => l.utilisateur_id === user._id
          ) || false
        );
      }

      // Vérifier si favorisé
      if (user) {
        const favResponse = await api.getFavorites(user._id);
        setIsFavorited(
          favResponse.favorites?.some((f: { oeuvre_id: string }) => f.oeuvre_id === id) || false
        );
      }
    } catch (error) {
      console.error('Error loading oeuvre:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user, loadCommentUsers]);

  useEffect(() => {
    loadOeuvre();
  }, [loadOeuvre]);

  const handleLike = async () => {
    if (!oeuvre || !user) return;
    try {
      if (isLiked) {
        await api.unlikeOeuvre(oeuvre._id);
      } else {
        await api.likeOeuvre(oeuvre._id);
      }
      setIsLiked(!isLiked);
      loadOeuvre();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFavorite = async () => {
    if (!oeuvre || !user) return;
    try {
      if (isFavorited) {
        await api.removeFavorite(user._id, oeuvre._id);
      } else {
        await api.addFavorite(user._id, oeuvre._id);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oeuvre || !user || !newComment.trim()) return;
    try {
      setSubmittingComment(true);
      await api.addComment(oeuvre._id, newComment);
      setNewComment('');
      loadOeuvre();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShareToClipboard = () => {
    if (oeuvre) {
      navigator.clipboard.writeText(`${window.location.origin}/post/${oeuvre._id}`);
      alert('Lien copié au presse-papiers!');
    }
  };

  const handleReport = async () => {
    if (!oeuvre || !user) return;
    try {
      await api.reportPost(oeuvre._id, 'contenu_inapproprie', "Contenu signalé par l'utilisateur");
      alert('Merci d\'avoir signalé ce contenu. Notre équipe va l\'examiner.');
    } catch (error) {
      console.error('Error reporting:', error);
    }
  };

  if (loading) return <LoadingPage />;
  if (!oeuvre) return <div className="flex items-center justify-center h-screen">Œuvre non trouvée</div>;

  const allImages = [oeuvre.url_image, ...oeuvre.urls_images_galerie];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/home')}
          className="mb-6 p-2 hover:bg-gray-200 rounded-full transition text-amber-800 font-bold flex items-center gap-2"
        >
          ← Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : Images */}
          <div className="lg:col-span-2">
            {/* Image principale */}
            <div className="relative mb-6">
              <img
                src={allImages[currentImageIndex]}
                alt={oeuvre.titre}
                className="w-full h-96 lg:h-full object-cover rounded-lg shadow-lg"
              />

              {/* Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1
                      )
                    }
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1
                      )
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Indicateurs */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Description et tags */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-700 mb-4">{oeuvre.description}</p>
              {oeuvre.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {oeuvre.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite : Info et interactions */}
          <div className="space-y-6">
            {/* Infos de l'œuvre */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-black mb-4">{oeuvre.titre}</h1>

              {/* Infos artiste */}
              {artist && (
                <div
                  className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => navigate(`/profile/${artist._id}`)}
                >
                  <img
                    src={artist.url_avatar || 'https://via.placeholder.com/50'}
                    alt={artist.nom_utilisateur}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-sm">{artist.nom_utilisateur}</p>
                    <p className="text-xs text-gray-600">Artiste</p>
                  </div>
                </div>
              )}

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-2 mb-6 text-center text-blue-400">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold">{oeuvre.nb_likes}</p>
                  <p className="text-xs text-gray-600">J'aime</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold">{oeuvre.nb_commentaires}</p>
                  <p className="text-xs text-gray-600">Commentaires</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold">{oeuvre.nb_vues}</p>
                  <p className="text-xs text-gray-600">Vues</p>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-2">
                <button
                  onClick={handleLike}
                  className={`w-full px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                    isLiked
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                  {isLiked ? "J'aime" : 'Aimer'}
                </button>

                <button
                  onClick={handleFavorite}
                  className={`w-full px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                    isFavorited
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  ★ {isFavorited ? 'Favori' : 'Ajouter aux favoris'}
                </button>

                <button
                  onClick={handleShareToClipboard}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                >
                  <Share2 size={18} />
                  Partager
                </button>

                <button
                  onClick={handleReport}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition text-sm"
                >
                  <Flag size={18} />
                  Signaler
                </button>
              </div>
            </div>

            {/* Section commentaires */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                Commentaires ({oeuvre.nb_commentaires})
              </h3>

              {/* Formulaire de commentaire */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajoutez un commentaire..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send size={16} />
                    Envoyer
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:underline"
                  >
                    Connectez-vous
                  </button>{' '}
                  pour commenter
                </p>
              )}

              {/* Liste des commentaires */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.length > 0 ? (
                  comments.map((comment) => {
                    const commentAuthor = commentUsers[comment.utilisateur_id];
                    return (
                      <div key={comment._id} className="p-3 bg-gray-50 rounded-lg">
                        {/* En-tête du commentaire : avatar + nom */}
                        <div
                          className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80 transition"
                          onClick={() =>
                            commentAuthor && navigate(`/profile/${commentAuthor._id}`)
                          }
                        >
                          {commentAuthor?.url_avatar ? (
                            <img
                              src={commentAuthor.url_avatar}
                              alt={commentAuthor.nom_utilisateur}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            /* Fallback initiale si pas d'avatar */
                            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                              <span className="text-blue-700 text-xs font-bold uppercase">
                                {commentAuthor?.nom_utilisateur?.[0] ?? '?'}
                              </span>
                            </div>
                          )}
                          <p className="font-bold text-sm text-gray-800">
                            {commentAuthor?.nom_utilisateur ?? comment.utilisateur_id}
                          </p>
                        </div>

                        {/* Contenu du commentaire */}
                        <p className="text-sm text-gray-700 ml-10">{comment.contenu}</p>

                        {/* Date */}
                        <p className="text-xs text-gray-400 mt-1 ml-10">
                          {new Date(comment.cree_le).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucun commentaire pour le moment
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
