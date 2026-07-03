import { Upload } from 'lucide-react';
import { ImgBBUploader } from '../../components/ui/ImgBBUploader';

interface UploadStep1Props {
  onImageSelect: (url: string) => void;
}

const UploadStep1: React.FC<UploadStep1Props> = ({ onImageSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
      <h1 className="text-3xl font-black uppercase mb-6 text-black">Importer votre Art</h1>
      <div className="bg-[#C6D2FF] border-4 border-black w-full max-w-md p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
        <div className="mb-6 flex items-center justify-center">
          <Upload size={50} className="text-purple-700" />
        </div>
        <p className="text-center font-bold text-black mb-6">Téléversez une image via ImgBB pour publier votre œuvre.</p>
        <ImgBBUploader onImageUpload={onImageSelect} label="Choisir une image" maxSizeKB={10240} />
      </div>
    </div>
  );
};

export default UploadStep1;
