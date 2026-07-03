import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './searchBar';
import { X } from 'lucide-react';
import logo from '../../assets/images/logo.png';
import { api } from '../../services/api';
import type { Post } from '../../types/post';
import PostCard from '../gallery/PostCard';
import { useToast } from '../../context/ToastContext';

const MainSearch: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    setLoading(true);
    try {
      const response = await api.searchOeuvres(query);
      setResults((response.posts as Post[]) || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Recherche impossible.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void runSearch();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-600 to-gray-400 relative overflow-y-auto pb-16">
      <button
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 transition"
        onClick={() => navigate('/home')}
        type="button"
      >
        <X size={32} />
      </button>

      <img src={logo} alt="logo" className="w-48 h-auto bg-cover" />
      <div className="w-full flex justify-center">
        <SearchBar query={query} onQueryChange={setQuery} onSubmit={runSearch} />
      </div>

      <div className="w-full max-w-6xl mt-10 px-4">
        <div className="mb-6 flex items-center justify-between text-white">
          <h2 className="text-2xl font-black uppercase italic">Resultats</h2>
          <span className="text-sm font-bold">{loading ? 'Recherche...' : `${results.length} oeuvre(s)`}</span>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {results.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white border-4 border-black p-8 text-center font-bold text-gray-600">
            {loading ? 'Recherche en cours...' : 'Aucun resultat.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainSearch;
