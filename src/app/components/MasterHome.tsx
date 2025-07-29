'use client';

import React from 'react';
import MasterHeader from './MasterHeader';
import Footer from './Footer';

interface HomeProps {
  children: React.ReactNode;
}

const MasterHome: React.FC<HomeProps> = ({ children }) => {

  return (
    <div className="h-screen flex flex-col">
      <MasterHeader />

      <main
        className={`flex-grow transition duration-300`}
      >
        <div className="flex-grow transition duration-300 overflow-y-auto scroll-ultrathin">
          {children}
        </div>
      </main>

      <footer
        className={`bottom-0 transition duration-300`}
      >
        <Footer />
      </footer>
    </div>
  );
};

export default MasterHome;
