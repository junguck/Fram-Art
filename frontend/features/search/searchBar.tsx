import { Search } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, onSubmit }) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="w-2/3 max-w-2xl h-14 bg-white border-2 border-black rounded-full flex items-center shadow-[6px_6px_0px_black] focus-within:shadow-[10px_10px_0px_black] transition-all"
    >
      <Search className="ml-4 text-gray-600" />

      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Rechercher une oeuvre..."
        className="flex-1 h-full px-4 bg-transparent outline-none text-lg font-semibold text-gray-800"
      />
    </form>
  );
};

export default SearchBar;
