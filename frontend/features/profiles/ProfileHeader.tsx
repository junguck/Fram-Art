import { GitBranch, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser } from '../../context/AuthContext';

interface ProfileHeaderProps {
  user: AuthUser;
  totalLikes?: number;
  totalViews?: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, totalLikes = 0, totalViews = 0 }) => {
  const navigate = useNavigate();
  const avatar = user.url_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom_utilisateur)}&background=111827&color=ffffff`;

  return (
    <div className="w-full flex flex-col items-center py-12 bg-white border-b-4 border-black mb-12">
      <div className="absolute right-0 top-0 flex gap-4">
          {user.role === 'artiste' ? (
             <button type="button" title="Dashboard" onClick={() => navigate(user.role === 'artiste' ? '/artist-dashboard' : '/dashboard')}>
            <GitBranch size={42} className="text-black hover:text-blue-700" />
          </button>
          ) : (
            null
          )}
         
          <button type="button" title="Modifier" onClick={() => navigate('/editProfile')}>
            <Pencil size={42} className="text-black hover:text-blue-700" />
          </button>
        </div>
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl w-full px-6 relative">
        

        <div className="w-40 h-40 rounded-full border-[5px] border-black shadow-[10px_10px_0px_0px_rgba(198,210,255,1)] overflow-hidden shrink-0 bg-gray-200">
          <img src={avatar} className="w-full h-full object-cover" alt={user.nom_utilisateur} />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl font-black mb-2 text-black my-4">{user.nom_utilisateur}</h1>
          <span className="text-xl text-gray-700">@{user.nom_utilisateur}</span>
          <p className="text-sm font-black uppercase tracking-tighter mb-4 text-blue-800">{user.role}</p>
          <div className="bg-gray-100 p-4 border-2 border-black inline-block">
            <p className="text-sm font-bold italic leading-tight max-w-md text-black">
              {user.bio || 'Aucune bio pour le moment.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="bg-indigo-600 border-2 border-black text-white p-4 flex flex-col items-center justify-center min-w-[100px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-2xl font-black">{totalLikes}</span>
            <span className="text-[10px] uppercase font-bold text-gray-200">Likes</span>
          </div>
          <div className="bg-yellow-300 border-2 border-black p-4 flex flex-col items-center justify-center min-w-[100px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-2xl font-black">{totalViews}</span>
            <span className="text-[10px] uppercase font-bold">Vues</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
