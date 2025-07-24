'use client'
import React, { useState } from 'react'
import DynamicHeader from './DynamicHeader';
import DynamicFooter from './DynamicFooter';

interface HomeProps {
  children: React.ReactNode;
}

const DynamicPage: React.FC<HomeProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="h-screen flex flex-col">
      <DynamicHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>
      
       <main className="flex-grow overflow-y-auto custom-scrollbar">
        {children}
      </main>
      
      <DynamicFooter />
    </div>
  )
}

export default DynamicPage