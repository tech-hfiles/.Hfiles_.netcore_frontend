import React from 'react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section
      className="healthcare-section"
      style={{
        backgroundImage: "url('https://hfiles.in/wp-content/uploads/2023/03/hero-bh-pattern2.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="main-heroheader">

        {/* Left Section */}
        <div className="text-content">
          <p className="small-text">Create your social health care network</p>
          <h1 className="main-heading">Get Smart With Your Health</h1>
          <p className="sub-text">Join India's Pioneering Social Healthcare Network</p>

          <a href="/signUp" className="cta-button">Create your health file</a>

          <div className="badges">
            <img 
              src="/journal-page-images/article/SecureStorageAssured.png"
              alt="Secure Storage Assured"
              width={120}
              height={60}
              className="badge"
            />
            <img 
              src="/journal-page-images/article/AyushmanBharat.png"
              alt="Ayushman Bharat"
              width={120}
              height={60}
              className="badge"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="image-circle family" >
          <img
            // src="https://hfiles.in/wp-content/uploads/2023/03/features-hero-6.png"
            src="/features-hero-6.png"
            alt="Hero Feature"
            width={600}
            height={500}
            className="elementor-animation-grow"
          />
        </div>
      </div>
    </section>
  );
}
