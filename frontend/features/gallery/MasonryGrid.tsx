// Gère l'affichage asymétrique des images sur l'accueil.
/**
 * @file MasonryGrid.tsx
 * @description Grille asymétrique pour l'affichage des œuvres.
 */

import { type Post } from '../../types/post';
import PostCard from './PostCard';

interface MasonryGridProps {
  posts: Post[];
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ posts }) => {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 p-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default MasonryGrid;