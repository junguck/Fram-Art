import React, { useState } from 'react';
import { Upload, Loader, AlertCircle } from 'lucide-react';

interface ImgBBUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  label?: string;
  maxSizeKB?: number;
  apiKey?: string;
}

export const ImgBBUploader: React.FC<ImgBBUploaderProps> = ({
  onImageUpload,
  label = 'Télécharger une image',
  maxSizeKB = 5000,
  apiKey = 'a192823060c6c6fbb99533c1ff9eb0a9',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [showApiKeyForm, setShowApiKeyForm] = useState(!apiKey);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (!apiKeyInput.trim()) {
      setError('Veuillez entrer votre clé API imgBB');
      setShowApiKeyForm(true);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > maxSizeKB * 1024) {
      setError(`L'image ne doit pas dépasser ${maxSizeKB}KB`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKeyInput}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageUpload(data.data.url);
        setError(null);
      } else {
        setError(data.error?.message || 'Erreur lors du téléchargement');
      }
    } catch (err) {
      setError('Erreur réseau lors du téléchargement');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Formulaire de clé API */}
      {showApiKeyForm && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Clé API imgBB
          </label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="Entrez votre clé API imgBB (https://imgbb.com/account/settings/api)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={() => setShowApiKeyForm(false)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Continuer
          </button>
        </div>
      )}

      {/* Upload area */}
      <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition bg-gray-50">
        <Upload className="w-8 h-8 text-gray-500 mb-2" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-500 mt-1">Max {maxSizeKB}KB</span>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
          className="hidden"
        />
      </label>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-blue-600">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">Téléchargement en cours...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
};
