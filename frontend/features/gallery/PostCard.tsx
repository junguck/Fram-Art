import { useState } from 'react';
import { Eye, Heart, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../types/post';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setLiked] = useState(false);
  const navigate = useNavigate();
  const profileTarget = post.author.id || post.author.name;

  const openPost = () => navigate(`/post/${post.id}`);

  const openProfile = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/profile/${encodeURIComponent(profileTarget)}`);
  };

  return (
    <article className="group relative bg-white border-2 border-black rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <button
        type="button"
        onClick={openPost}
        className="block w-full aspect-[4/5] overflow-hidden border-b-2 border-black bg-gray-100 text-left"
        aria-label={`Voir ${post.title}`}
      >
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover grayscale-[0.2] transition-all duration-300 group-hover:scale-[1.03] group-hover:grayscale-0"
        />
      </button>

      <div className="p-3 bg-white flex flex-col gap-3">
        <div className="flex justify-between items-start gap-3">
          <button
            type="button"
            className="min-w-0 text-left font-bold text-sm uppercase truncate text-accent-content hover:underline"
            onClick={openPost}
          >
            {post.title}
          </button>

          <div className="flex shrink-0 gap-3 text-gray-600">
            <div className="flex items-center gap-1" title="Vues">
              <Eye size={16} />
              <span className="text-xs font-medium">{post.stats.views}</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 hover:text-red-500"
              onClick={(event) => {
                event.stopPropagation();
                setLiked(!isLiked);
              }}
              title="Like"
            >
              <Heart size={16} className={isLiked ? 'text-red-500' : ''} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-xs font-medium">{post.stats.likes}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={openProfile}
          className="flex w-fit max-w-full items-center gap-2 rounded-full pr-2 text-left transition hover:bg-gray-100"
          title={`Voir le profil de ${post.author.name}`}
        >
          <span className="grid w-7 h-7 place-items-center rounded-full bg-gray-200 border border-black overflow-hidden">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="h-full w-full object-cover" />
            ) : (
              <UserCircle2 size={20} className="text-gray-500" />
            )}
          </span>
          <span className="min-w-0 truncate text-[11px] font-bold text-gray-600 italic hover:text-black">
            @{post.author.name}
          </span>
        </button>
      </div>
    </article>
  );
};

export default PostCard;
