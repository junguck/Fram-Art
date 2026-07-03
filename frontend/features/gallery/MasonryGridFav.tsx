import { type Post } from '../../types/post';
import PostCardFav from './PostCardFav';

interface MasonryGridProps {
  posts: Post[];
}

const MasonryGridFav: React.FC<MasonryGridProps> = ({ posts }) => {
  return (
    <div className="p-6">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
        {posts.map((post, index) => (
          <div key={post.id} className="break-inside-avoid">
            <PostCardFav post={post} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGridFav;