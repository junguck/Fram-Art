import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isActive,bouttonCreer] = useState<boolean>(false);

  return (
    <div className="flex h-screen bg-[#f0f0f0] overflow-hidden font-sans">
      <Sidebar />

      {/* Conteneur principal */}
      <div className="flex flex-col flex-1 relative overflow-hidden">
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>

        {/* Bouton "Créer" Flottant - Présent sur accueil.jpg et favorites-pages.jpg */}
        <button 
          onClick={() => navigate('/upload')}
          className="absolute bottom-10 right-10 w-16 h-16 bg-[#C6D2FF] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:scale-110 transition-transform active:translate-y-1 active:shadow-none border border-white/50"
          title="Créer un post"
        >
          {isActive ? (
            <span className="text-3xl font-serif italic font-bold text-blue-600" onMouseLeave={() => bouttonCreer(false)}>Creer</span>
          ) : (
            <Plus size={35} className="text-blue-600" onMouseOver={() => bouttonCreer(true)}/>
          )}
          
        </button>
      </div>
    </div>
  );
};

export default MainLayout;
