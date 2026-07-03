// Formulaire Titre + Description.
/**
 * @file UploadStep2.tsx
 * @description Deuxième étape : Ajout des infos et prévisualisation.
 */

interface UploadStep2Props {
  imageUrl: string;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  onBack: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

const UploadStep2: React.FC<UploadStep2Props> = ({ 
  imageUrl, title, setTitle, description, setDescription, onBack, onPublish, isPublishing = false 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-8 duration-300">
      
      {/* Formulaire (Titre & Description) */}
      <div className="bg-[#C6D2FF] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
        <div>
          <label className="block bg-gray-200 border-2 border-black w-fit px-4 py-1 font-bold -mb-0.5 relative z-10">Titre</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border-2 border-black focus:outline-none focus:bg-yellow-50 text-black"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label className="block font-bold mb-2">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full flex-1 p-3 border-2 border-black resize-none focus:outline-none focus:bg-yellow-50 min-h-40 text-black"
          />
        </div>
      </div>

      {/* Prévisualisation et Boutons */}
      <div className="flex flex-col justify-between">
        <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
           <img src={imageUrl} alt="Preview" className="w-full h-auto max-h-75 object-cover border-2 border-black mb-4" />
           <p className="font-black text-lg truncate text-black">{title || "Titre de l'oeuvre"}</p>
        </div>

        <div className="flex justify-between gap-4">
          <button 
            onClick={onBack}
            type="button"
            className="flex-1 bg-gray-700 text-white font-bold py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"
          >
            Retour
          </button>
          
          <button 
            onClick={onPublish}
            type="button"
            disabled={isPublishing || !title.trim()}
            className="flex-1 bg-linear-to-r from-orange-400 to-red-500 text-white font-black py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-1 disabled:hover:translate-y-0"
          >
            {isPublishing ? 'Publication...' : 'Poster'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default UploadStep2;