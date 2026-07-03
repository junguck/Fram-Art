import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import type { Post } from '../../types/post';
import { api } from '../../services/api';
import LoadingPage from '../../components/ui/LoadingPage';
// Données de test pour visualiser (à remplacer par ton API plus tard)
const FeedPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      try {
        const result = await api.getPosts();
        const apiPosts = (result.posts as Post[]) || [];
        if (!cancelled && apiPosts.length > 0) {
          setPosts(apiPosts);
        }
      } catch (error) {
        console.error('Erreur chargement oeuvres:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {loading && <div className="p-4 text-sm font-bold text-gray-500">
        <LoadingPage />
        </div>}
      {/* Grille responsive : 1 col sur mobile, 2 sur tablette, 3 ou 4 sur desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 p-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
