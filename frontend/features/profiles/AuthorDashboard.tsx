import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../gallery/PostCard';
import EditProfilePage from './EditProfilePage';
import type { Post } from '../../types/post';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LoadingPage from '../../components/ui/LoadingPage';
import { useToast } from '../../context/ToastContext';

const AuthorDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'works' | 'edit'>('works');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await api.getArtistWorks(user._id);
        if (!cancelled) setPosts((response.data as Post[]) || []);
      } catch (error) {
        if (!cancelled) showToast(error instanceof Error ? error.message : 'Impossible de charger le dashboard.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, [showToast, user]);

  const totals = useMemo(
    () =>
      posts.reduce(
        (acc, post) => ({
          views: acc.views + (post.stats?.views || 0),
          likes: acc.likes + (post.stats?.likes || 0),
        }),
        { views: 0, likes: 0 }
      ),
    [posts]
  );

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic">Mon Studio</h1>
          <p className="font-bold text-gray-500 italic">Gerez vos creations et votre profil</p>
        </div>

        <div className="flex gap-2 bg-white p-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={() => setActiveTab('works')}
            className={`px-4 py-2 flex items-center gap-2 font-bold transition-all ${activeTab === 'works' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            <LayoutGrid size={18} /> MES FRAMES
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 flex items-center gap-2 font-bold transition-all ${activeTab === 'edit' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            <Settings size={18} /> REGLAGES
          </button>
        </div>
      </div>

      {activeTab === 'works' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Vues Totales', val: totals.views, color: 'bg-blue-200' },
              { label: 'Appreciations', val: totals.likes, color: 'bg-red-200' },
              { label: 'Frames Publiees', val: posts.length, color: 'bg-green-200' },
              { label: 'Abonnes', val: user?.compteurs?.abonnes || user?.abonnes_ids?.length || 0, color: 'bg-yellow-200' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color} border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
                <p className="text-[10px] font-black uppercase mb-1">{stat.label}</p>
                <p className="text-3xl font-black">{stat.val}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <LoadingPage />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="border-4 border-dashed border-gray-400 aspect-[4/5] flex flex-col items-center justify-center hover:border-black hover:bg-gray-50 cursor-pointer transition-all group"
              >
                <div className="p-4 bg-gray-100 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                  <Plus size={32} />
                </div>
                <span className="mt-4 font-black uppercase text-sm">Nouvelle Frame</span>
              </button>

              {posts.map((post) => (
                <div key={post.id} className="h-full">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <EditProfilePage />
      )}
    </div>
  );
};

export default AuthorDashboard;
