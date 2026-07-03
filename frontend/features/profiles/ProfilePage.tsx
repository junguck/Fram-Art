import { useEffect, useMemo, useState } from 'react';
import ProfileHeader from './ProfileHeader';
import PostCard from '../gallery/PostCard';
import type { Post } from '../../types/post';
import { useAuth } from '../../context/AuthContext';
import CandidatureTab from './CandidatureTab';
import { api } from '../../services/api';
import LoadingPage from '../../components/ui/LoadingPage';
import { useToast } from '../../context/ToastContext';

type TabType = 'works' | 'candidature' | 'subscribers';

const ProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('works');
  const [works, setWorks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadWorks = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await api.getArtistWorks(user._id);
        if (!cancelled) {
          setWorks((response.data as Post[]) || []);
        }
      } catch (error) {
        if (!cancelled) {
          setWorks([]);
          showToast(error instanceof Error ? error.message : 'Impossible de charger vos oeuvres.', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadWorks();

    return () => {
      cancelled = true;
    };
  }, [showToast, user]);

  const totals = useMemo(() => {
    return works.reduce(
      (acc, post) => ({
        likes: acc.likes + (post.stats?.likes || 0),
        views: acc.views + (post.stats?.views || 0),
      }),
      { likes: 0, views: 0 }
    );
  }, [works]);

  if (!user) return <LoadingPage />;

  const tabs: TabType[] = ['works'];
  if (user.role === 'utilisateur') tabs.push('candidature');
  if (user.role === 'artiste') tabs.push('subscribers');

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <ProfileHeader user={user} totalLikes={totals.likes} totalViews={totals.views} />

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex gap-8 mb-10 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 font-semibold uppercase text-sm transition ${
                activeTab === tab ? 'text-black border-b-2 border-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {tab === 'works' && 'Toutes les oeuvres'}
              {tab === 'candidature' && 'Candidature'}
              {tab === 'subscribers' && 'Abonnes'}
            </button>
          ))}
        </div>

        {activeTab === 'works' && (
          <>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-black">
                Toutes les oeuvres
              </h2>
              <div className="flex-1 h-1 bg-black"></div>
              <span className="font-bold text-sm italic">{works.length} ITEMS</span>
            </div>

            {loading ? (
              <LoadingPage />
            ) : works.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {works.map((post) => (
                  <div key={post.id} className="h-full">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-black p-8 text-center font-bold text-gray-600">
                Aucune oeuvre publiee pour le moment.
              </div>
            )}
          </>
        )}

        {activeTab === 'candidature' && <CandidatureTab />}

        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-lg p-8 border-2 border-black">
            <h3 className="text-xl font-bold mb-4">Abonnes</h3>
            <p className="text-gray-600">Vous avez {user.compteurs?.abonnes || user.abonnes_ids?.length || 0} abonnes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
