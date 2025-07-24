'use client';
import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

interface HomeProps {
  children: React.ReactNode;
}

const Home: React.FC<HomeProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header/>

      <main
        className={`flex-grow transition duration-300 
         blur-sm pointer-events-none
        `}
      >
        <div className="min-w-7xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      <footer
        className={`sticky bottom-0 transition duration-300 
          blur-sm pointer-events-none
        `}
      >
        <Footer />
      </footer>
    </div>
  );
};

export default Home;
