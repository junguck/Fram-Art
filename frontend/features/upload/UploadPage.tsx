/**
 * @file UploadPage.tsx
 * @description Conteneur principal du processus d'upload.
 */

import React, { useState } from 'react';
import UploadStep1 from './UploadStep1';
import UploadStep2 from './UploadStep2';
import SuccessModal from './SuccessModal';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';



const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  // Gestion de l'état (les données du formulaire)
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Actions
  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setStep(2); // On passe automatiquement à l'étape 2
  };

  const handlePublish = async () => {
    if (!selectedImage) {
      alert("Veuillez d'abord télécharger une image.");
      return;
    }
    if (!title.trim()) {
      alert('Veuillez saisir un titre pour votre œuvre.');
      return;
    }

    setIsPublishing(true);
    try {
      await api.createPost({
        titre: title.trim(),
        description: description.trim(),
        url_image: selectedImage,
        tags: [],
        categorie: null,
        est_publiee: true,
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Error publishing artwork:', error);
      alert('Impossible de publier l’œuvre. Veuillez réessayer.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedImage(null);
    setTitle('');
    setDescription('');
    setShowSuccess(false);
    navigate('/home');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 relative h-full flex flex-col justify-center">
      {/* Affichage conditionnel des étapes */}
      {step === 1 && (
        <UploadStep1 onImageSelect={handleImageSelect} />
      )}

      {step === 2 && selectedImage && (
        <UploadStep2 
          imageUrl={selectedImage}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          onBack={() => setStep(1)}
          onPublish={handlePublish}
          isPublishing={isPublishing}
        />
      )}

      {/* Le modal de succès qui se superpose au reste */}
      {showSuccess && <SuccessModal onFinish={handleReset} />}
    </div>
  );
};

export default UploadPage;
