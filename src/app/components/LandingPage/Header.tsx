'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <div>
      <header className="header">
        <img
          // src="https://hfiles.in/wp-content/uploads/2022/11/hfiles.png"
          src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
          alt="hfiles logo"
          width={150}
          height={60}
        />

        {/* Sign In Button (Top Right) */}
        {/* <Link href="/login">
          <div className="signup">
            <p>Sign In</p>
          </div>
        </Link>*/}
    <a href="/login" className="header-signin"> 
    <div className="signup">
      <p>Sign In</p>
    </div>
    </a>
        {/* Navigation Links */}
        <nav className="nav">
          <ul className="nav-links">
            <li>
              <a href="#about_us_section" className="aboutus">
                About us
              </a>
            </li>
            <li>
         
          <Link href="/articles">Article</Link>
            </li>
            <li>   
              <a href="/login">
                <div className="signup">
                  <p>Sign In</p>
                </div>
              </a>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}
