
import type { ReactNode } from 'react';


interface AuthLayoutProps {
  children: ReactNode;
  imageSrc: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, imageSrc }) => {
  return (
    <div className="flex h-screen w-full bg-[#D2CFBC] overflow-hidden">
      {/* Section Gauche : L'œuvre d'art (Gallerie) */}
      <div className="hidden lg:flex lg:w-1/2 lg:h-full relative p-8">
        <div className="w-full h-full rounded-b-sm shadow-2xl overflow-hidden relative border-8  border-[#5D5D5B] lg:w-full lg:h-full shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
          <img 
            src={imageSrc} 
            alt="Artistic background" 
            className="w-full h-full object-cover "
          />
        </div>
      </div>

      {/* Section Droite : Le Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="bg-[#F2F0E9] p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-md border border-white/50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
