'use client';
import React, { useState } from 'react';
import Header from './LandingPage/Header';
import Footer from './Footer';

interface HomeProps {
  children: React.ReactNode;
}

const Home: React.FC<HomeProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <Header  />

      <main
        className={`transition duration-300 ${
          isMenuOpen ? 'blur-sm pointer-events-none' : ''
        } `}
      >
        <div className="min-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

        <Footer />
    </div>
  );
};

export default Home;
