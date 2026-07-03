// L'écran vert "Publier / Terminer".
/**
 * @file SuccessModal.tsx
 * @description Fenêtre superposée confirmant la publication.
 */

import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  onFinish: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onFinish }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="bg-green-600 border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center animate-in zoom-in duration-300">
        
        <div className="flex items-center gap-4 text-white mb-8">
          <CheckCircle size={50} fill="white" className="text-green-600" />
          <h2 className="text-4xl font-black uppercase">Publié !</h2>
        </div>

        <button 
          onClick={onFinish}
          className="bg-white text-black px-10 py-2 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-200 active:translate-y-1 active:shadow-none transition-all"
        >
          Terminer
        </button>

      </div>

    </div>
  );
};

export default SuccessModal;