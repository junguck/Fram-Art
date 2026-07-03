import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Candidature } from '../../types/user';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const CandidatureTab: React.FC = () => {
  const { user } = useAuth();
  const [candidature, setCandidature] = useState<Candidature | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    motivation: '',
    url_portfolio: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCandidature();
  }, [user]);

  const loadCandidature = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.getMyApplication(user._id);
      if (response.data) {
        setCandidature(response.data);
      } else {
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error loading candidature:', error);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.motivation.length < 100) {
      setError('La motivation doit contenir au moins 100 caractères');
      return;
    }

    if (!formData.url_portfolio.trim()) {
      setError('Veuillez entrer l\'URL de votre portfolio');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await api.applyForArtist(user._id, formData.motivation, formData.url_portfolio);
      setSuccess('Candidature soumise avec succès! Notre équipe examinera votre demande.');
      setShowForm(false);
      loadCandidature();
    } catch (err) {
      setError('Erreur lors de la soumission de la candidature');
      console.error('Error submitting candidature:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center">Chargement...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {candidature ? (
        // Afficher l'état de la candidature
        <div className="bg-white rounded-lg p-8">
          <div className="mb-6">
            {candidature.statut === 'approuve' && (
              <div className="flex gap-4 p-4 bg-green-50 border border-green-300 rounded-lg">
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-green-900">Candidature Approuvée</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Félicitations! Vous êtes maintenant artiste vérifiée sur Frame'Art.
                  </p>
                </div>
              </div>
            )}

            {candidature.statut === 'en_attente' && (
              <div className="flex gap-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <Clock className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-blue-900">En Attente d'Examen</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Votre candidature est en cours de révision par notre équipe.
                    Soumis le {new Date(candidature.soumis_le).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            )}

            {candidature.statut === 'rejete' && (
              <div className="flex gap-4 p-4 bg-red-50 border border-red-300 rounded-lg">
                <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-red-900">Candidature Rejetée</h3>
                  {candidature.message_decision && (
                    <p className="text-sm text-red-700 mt-2">{candidature.message_decision}</p>
                  )}
                  {candidature.nb_resoumissions < 3 && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Resoummettre une candidature
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block font-semibold text-gray-900 mb-1">Motivation</label>
              <p className="text-gray-700">{candidature.motivation}</p>
            </div>
            <div>
              <label className="block font-semibold text-gray-900 mb-1">Portfolio</label>
              <a
                href={candidature.url_portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {candidature.url_portfolio}
              </a>
            </div>
          </div>
        </div>
      ) : showForm ? (
        // Formulaire de candidature
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Postuler pour Devenir Artiste</h2>
            <p className="text-gray-600">
              Présentez votre travail et expliquez pourquoi vous souhaitez rejoindre Frame'Art.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg flex gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-300 rounded-lg flex gap-2">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Motivation (minimum 100 caractères) *
            </label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              rows={6}
              placeholder="Décrivez votre parcours artistique, vos inspirations, et pourquoi vous souhaitez rejoindre notre communauté..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <span className="text-xs text-gray-500 mt-1">
              {formData.motivation.length}/100 caractères minimum
            </span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              URL du Portfolio *
            </label>
            <input
              type="url"
              name="url_portfolio"
              value={formData.url_portfolio}
              onChange={handleInputChange}
              placeholder="https://votreportfolio.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
          </button>
        </form>
      ) : null}
    </div>
  );
};

export default CandidatureTab;
