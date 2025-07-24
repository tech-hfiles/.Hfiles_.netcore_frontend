import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

const Search: React.FC<SearchProps> = ({ onSearch, placeholder = "Search folders..." }) => {
  const [showInput, setShowInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSearch = () => {
    if (showInput) {
      // Only clear search when closing if there's a search term
      if (searchTerm) {
        setSearchTerm('');
        onSearch('');
      }
    }
    setShowInput((prev) => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="w-full flex justify-end items-center mt-4 px-4">
      {/* Desktop view: full search bar */}
      <div className="hidden sm:flex items-center border border-black rounded-full overflow-hidden w-full max-w-sm relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2 pr-8 text-sm focus:outline-none placeholder-black"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-12 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
        <button className="w-10 h-10 rounded-full bg-[#061750] flex items-center justify-center">
          <FaSearch className="text-white text-sm" />
        </button>
      </div>

      {/* Mobile view: toggleable search input */}
      <div className="sm:hidden w-full">
        {showInput ? (
          <div className="flex items-center border border-black rounded-full overflow-hidden w-full relative">
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 pr-4 text-sm focus:outline-none placeholder-black"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-12 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
            <button 
              onClick={toggleSearch}
              className="w-10 h-10 rounded-full bg-[#061750] flex items-center justify-center"
            >
              <FaSearch className="text-white text-sm" />
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={toggleSearch}
              className="w-10 h-10 rounded-full bg-[#061750] hover:bg-[#0c2170] shadow-md flex items-center justify-center transition-all duration-200"
              aria-label="Open search"
            >
              <FaSearch className="text-white text-sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;