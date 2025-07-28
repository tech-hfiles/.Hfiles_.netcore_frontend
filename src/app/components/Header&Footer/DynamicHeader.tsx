"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { X, Menu } from "lucide-react";

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}

const DynamicHeader: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/");
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0331B5] text-white shadow-md">
      {/* Container with max spacing and centering */}
      <div className="w-full px-4 p-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
            alt="HFiles Logo"
            className="h-10 sm:h-10 md:h-12 xl:h-15 w-auto object-contain"
          />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex gap-4 md:gap-6 items-center text-sm md:text-base font-semibold">
          <div className="cursor-pointer hover:underline">About Us</div>
          <div className="cursor-pointer hover:underline"><a
  href="https://articles.hfiles.in/"
  rel="noopener noreferrer"
  className="cursor-pointer hover:underline"
>
  Article
</a>
</div>
          <button
            className="bg-yellow-400 text-blue-700 px-4 py-2 rounded hover:bg-yellow-300 transition font-bold"
            onClick={handleSignIn}
          >
            Sign Up
          </button>
        </nav>
      </div>

      {/* Sidebar Drawer for Mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-full bg-white text-blue-800 z-50 shadow-lg transform transition-transform duration-300 sm:hidden ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Menu</h2>
          <button onClick={() => setIsMenuOpen(false)} aria-label="Close Menu">
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col p-4 gap-4 font-semibold">
          <div className="cursor-pointer hover:underline">About Us</div>
          <div className="cursor-pointer hover:underline"><a
            href="https://articles.hfiles.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer hover:underline"
          >
            Article
          </a>
          </div>
          <button
            className="bg-yellow-400 text-blue-700 px-4 py-2 rounded hover:bg-yellow-300 w-fit font-bold"
            onClick={() => {
              setIsMenuOpen(false);
              handleSignIn();
            }}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default DynamicHeader;
