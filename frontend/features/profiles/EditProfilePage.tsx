import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Artist } from '../../types/user';
import { ImgBBUploader } from '../../components/ui/ImgBBUploader';
import { Save, ArrowLeft, Eye, EyeOff, Loader } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const EditProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [, setArtist] = useState<Artist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    email: '',
    bio: '',
    url_avatar: '',
    // Artiste fields
    url_portfolio: '',
    specialites: [] as string[],
    // Password
    password: '',
    confirmPassword: '',
  });

  const [newSpecialite, setNewSpecialite] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nom_utilisateur: user.nom_utilisateur || '',
        email: user.email || '',
        bio: user.bio || '',
        url_avatar: user.url_avatar || '',
      }));

      if (user.role === 'artiste') {
        loadArtistData();
      }
    }
  }, [user]);

  const loadArtistData = async () => {
    if (!user) return;
    try {
      const response = await api.getArtist(user._id);
      if (response.data) {
        setArtist(response.data);
        setFormData((prev) => ({
          ...prev,
          url_portfolio: response.data.url_portfolio || '',
          specialites: response.data.specialites || [],
        }));
      }
    } catch (error) {
      console.error('Error loading artist data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpload = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      url_avatar: imageUrl,
    }));
  };

  const addSpecialite = () => {
    if (newSpecialite.trim() && !formData.specialites.includes(newSpecialite.trim())) {
      setFormData((prev) => ({
        ...prev,
        specialites: [...prev.specialites, newSpecialite.trim()],
      }));
      setNewSpecialite('');
    }
  };

  const removeSpecialite = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialites: prev.specialites.filter((s) => s !== spec),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      showToast('Les mots de passe ne correspondent pas.', 'error');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Préparer les données à envoyer
      const updateData: any = {
        nom_utilisateur: formData.nom_utilisateur,
        email: formData.email,
        bio: formData.bio,
        url_avatar: formData.url_avatar,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      // Mettre à jour le profil utilisateur
      await api.updateProfile(user._id, updateData);

      // Mettre à jour les données artiste si applicable
      if (user.role === 'artiste') {
        const artistUpdate: any = {
          url_portfolio: formData.url_portfolio,
          specialites: formData.specialites,
        };
        await api.updateArtist(user._id, artistUpdate);
      }

      setSuccess('Profil mis à jour avec succès!');
      showToast('Profil mis à jour avec succès.', 'success');
      await refreshUser();

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/profiles');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil';
      setError(message);
      showToast(message, 'error');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Non authentifié</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 text-mauve-500">
      <div className="max-w-2xl mx-auto px-6">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/profiles')}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black uppercase italic">Modifier le Profil</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 space-y-8">
          {/* Messages de feedback */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Section Avatar */}
          <div>
            <h2 className="text-lg font-bold mb-4">Photo de Profil</h2>
            <div className="flex gap-6 items-start">
              <img
                src={formData.url_avatar || 'https://via.placeholder.com/100'}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <ImgBBUploader onImageUpload={handleAvatarUpload} label="Télécharger une photo" />
              </div>
            </div>
          </div>

          {/* Informations de base */}
          <div>
            <h2 className="text-lg font-bold mb-4">Informations de Base</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  name="nom_utilisateur"
                  value={formData.nom_utilisateur}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Parlez un peu de vous..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section mot de passe */}
          <div>
            <h2 className="text-lg font-bold mb-4">Mot de Passe</h2>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nouveau mot de passe (optionnel)
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Laissez vide pour ne pas changer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Section artiste */}
          {user.role === 'artiste' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Informations Artiste</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    URL du Portfolio
                  </label>
                  <input
                    type="url"
                    name="url_portfolio"
                    value={formData.url_portfolio}
                    onChange={handleInputChange}
                    placeholder="https://votreportfolio.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Spécialités
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSpecialite}
                      onChange={(e) => setNewSpecialite(e.target.value)}
                      placeholder="Ex: Illustration 3D, Photography..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSpecialite();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addSpecialite}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.specialites.map((spec, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => removeSpecialite(spec)}
                          className="text-blue-700 hover:text-blue-900 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-black text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Sauvegarde en cours...
              </>
            ) : (
              <>
                <Save size={20} />
                Sauvegarder les modifications
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
