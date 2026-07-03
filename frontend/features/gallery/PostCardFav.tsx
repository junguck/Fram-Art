import { Heart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../types/post';
import { useState } from 'react';

interface PostCardProps {
  post: Post;
  index?: number;
}

const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
const translations = ['translate-y-2', '-translate-y-2', 'translate-y-4', '-translate-y-1'];

const PostCardFav: React.FC<PostCardProps> = ({ post, index = 0 }) => {
  const [isLiked, setLiked] = useState<boolean>(false);
  const navigate = useNavigate();

  const randomStyle = `${rotations[index % rotations.length]} ${translations[index % translations.length]}`;

  return (
    <div
      className={`group relative bg-white border-2 border-black rounded-xl 
      shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
      transition-all duration-300
      hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
      ${randomStyle}`}
    >
      {/* Image */}
      <div className="overflow-hidden border-b-2 border-black rounded-t-xl">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full object-cover hover:scale-105 transition duration-300"
          onClick={() => navigate(`/post/${post.id}`)}
        />
      </div>

      {/* Infos */}
      <div className="p-3 bg-white flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span
            className="font-bold text-sm uppercase truncate cursor-pointer"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            {post.title}
          </span>

          <div className="flex gap-3 text-gray-600">
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span className="text-xs">{post.stats.views}</span>
            </div>

            <div className="flex items-center gap-1">
              <Heart
                size={16}
                className={`cursor-pointer ${isLiked ? 'text-red-500' : ''}`}
                onClick={() => setLiked(!isLiked)}
              />
              <span className="text-xs">{post.stats.likes}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-200 border border-black overflow-hidden" />
          <span className="text-[10px] font-bold text-gray-500 italic">
            @{post.author.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostCardFav;