'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaInstagram } from 'react-icons/fa';
import { faFacebook, faInstagram, faLinkedin, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
export default function Footer() {
  const [showPopup, setShowPopup] = useState(false);

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);

  return (
    <>
      {/* Popup */}
      {showPopup && (
  <div className={styles.popupOverlay}>
    <div className={styles.popupContent}>
      <span className={styles.closeBtn} onClick={closePopup}>
        &times;
      </span>
      <h2 style={{fontSize:'1.5em',fontWeight:'bold'}}>Do you want any help <br/>with Your Account?</h2>
      <p>Contact us at <a href="mailto:contact@hfiles.in">contact@hfiles.com</a></p>
    </div>
  </div>
)}

      {/* Footer Section */}
      <section className="footer_section">
        <div className="main_footer">
          <div className="logo_section">
            <img
              src="https://hfiles.in/wp-content/uploads/2022/11/hfiles.png"
              alt="hfiles logo"
              className="footer-logo"
              width={150}
              height={50}
              loading="lazy"
              decoding="async"
            />
            <p>Be a part of India's first social healthcare network</p>
            <div className="footer_icons">
              <h3>Join us</h3>
              <hr />
               <div className="social-icons flex gap-3">
      <a
        href="https://www.instagram.com/hfiles.in/"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full text-white"
        style={{
          background:
            'linear-gradient(315deg, #FBE18A 0.96%, #FCBB45 21.96%, #F75274 38.96%, #D53692 52.96%, #8F39CE 74.96%, #5B4FE9 100.96%)',
        }}
      >
        <i className="fab fa-instagram"></i>
        <FontAwesomeIcon icon={faInstagram}  style={{ fontSize: '2rem' }}/>
      </a>
      <a
        href="https://x.com/health_files"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full text-white"
        style={{ backgroundColor: '#1D9BF0' }}
      >
        <i className="fab fa-twitter"></i>
      <FontAwesomeIcon icon={faTwitter} style={{ fontSize: '2rem' }}/>
      </a>
      <a
        href="https://www.linkedin.com/company/health-files/"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full text-white"
        style={{ backgroundColor: '#0A66C2' }}
      >
        <i className="fab fa-linkedin"></i>
        <FontAwesomeIcon icon={faLinkedin} style={{ fontSize: '2rem' }} />
      </a>
      <a
        href="https://www.youtube.com/@healthfiles"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full text-white"
        style={{ backgroundColor: '#ff0000' }}
      >
        <i className="fab fa-youtube"></i>
        <FontAwesomeIcon icon={faYoutube} style={{ fontSize: '2rem' }} />
      </a>
      <a
        href="https://www.facebook.com/profile.php?id=61563889084881"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full text-white"
        style={{ backgroundColor: '#1877F2' }}
      >
        <i className="fab fa-facebook"></i>
        <FontAwesomeIcon icon={faFacebook} style={{ fontSize: '2rem' }} />
      </a>
    </div>
            </div>
          </div>

          <div className="footer_links">
            <div className="help_section">
              <div className="help_header">
                <h3>
                  <u>Let us help you</u>
                </h3>
              </div>
              <a href="#" onClick={handleAccountClick}>
                <p>Your Account</p>
              </a>
              <a href="#talkus">
                <p>Contact Us</p>
              </a>
              <a href="/FAQ">
                <p>FAQs</p>
              </a>
            </div>

            <div className="policies_section">
              <div className="policies_header">
                <h3>
                  <u>Our Policies</u>
                </h3>
              </div>
          <Link href="/TermsAndConditions">
  <p>Terms & Conditions</p>
</Link>
              <Link href="/PrivacyPolicy">
                <p>Privacy Policy</p>
              </Link>
            </div>

            <div className="address_section">
              <div className="address_header">
                <h3>
                  <u>Address</u>
                </h3>
              </div>
              <hr />
              <div className="addresses">
                <div className="first_address">
                  <h1>Ahmedabad branch</h1>
                  <p>
                    5-A, Ravi Pushp Apartment,
                    <br /> Ahmedabad - 380052, Gujarat
                  </p>
                </div>
                <div className="sec_address">
                  <h1>Mumbai branch</h1>
                  <p>
                    13/4, Marine Lines, Mumbai -
                    <br /> 400020, Maharashtra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="footer">
        <p>
          Copyright @2025 H.Files. All rights reserved by Health Files Medico
          Pvt. Ltd.
        </p>
      </div>
    </>
  );
}
