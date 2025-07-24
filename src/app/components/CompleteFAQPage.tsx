'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Header from './LandingPage/Header';
import Footer from './LandingPage/Footer';

export default function FAQPage() {
  const [openAccordion, setOpenAccordion] = useState('collapseOne');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const toggleAccordion = (target: React.SetStateAction<string>) => {
    setOpenAccordion(openAccordion === target ? '' : target);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const faqData = [
    {
      id: 'collapseOne',
      question: 'How many members can I add?',
      answer: 'You can add only 5 members for free; to add more, you\'ll need to upgrade your plan..'
    },
    {
      id: 'collapseTwo',
      question: 'How many documents can I upload?',
      answer: 'A total of 100 MB disk space is allocated for an individual with free account.'
    },
    {
      id: 'collapseThree',
      question: 'What type of documents can I upload?',
      answer: 'Any relevant medical history documentation, including X-rays, sonograms, and prescriptions, can be submitted.'
    },
    {
      id: 'collapseFour',
      question: 'Can I add pets as a member in my profile?',
      answer: 'Absolutely, we care for pets too.'
    },
    {
      id: 'collapseFive',
      question: 'How can I edit my personal info?',
      answer: 'Email us at contact@hfiles.in'
    }
  ];

  return (
    <>
      <Head>
        <title>FAQ's</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page-container">
        {/* Header */}
        <Header/>
        {/* Main Content */}
        <div className="faq_main">
          <Link href="/" className="back-arrow-btn">
            Back
          </Link>

          <div className="content-wrapper">
            <div className="content-container">
              <h2 className="heading">Frequently Asked Questions</h2>
              <div className="accordion-wrapper">
                <div className="accordion">
                  {faqData.map((faq) => (
                    <div key={faq.id} className="accordion-item">
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${openAccordion === faq.id ? '' : 'collapsed'}`}
                          type="button"
                          onClick={() => toggleAccordion(faq.id)}
                          aria-expanded={openAccordion === faq.id}
                        >
                          {faq.question}
                        </button>
                      </h2>
                      <div className={`accordion-collapse collapse ${openAccordion === faq.id ? 'show' : ''}`}>
                        <div className="accordion-body">
                          <strong>
                            {faq.answer}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popup */}
        {showPopup && (
          <div className="popup-overlay" onClick={() => setShowPopup(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <span className="close-btn" onClick={() => setShowPopup(false)}>&times;</span>
              <h2>Do you want any help with Your Account?</h2>
              <p>Contact us at <a href="mailto:contact@hfiles.in">contact@hfiles.in</a></p>
            </div>
          </div>
        )}

        {/* Footer */}
        <section className="footer_section">
          <div className="main_footer">
            <div className="logo_section">
              <img src="https://hfiles.in/wp-content/uploads/2022/11/hfiles.png" alt="hfiles logo" />
              <p>Be a part of India's first social healthcare network</p>
              
              <div className="footer_icons">
                <h3>Join us</h3>
                <hr />
                <div className="social-icons">
                  <a href="https://www.instagram.com/hfiles.in/" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://x.com/health_files" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://www.linkedin.com/company/health-files/" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a href="https://www.youtube.com/@healthfiles" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61563889084881" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook"></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="footer_links">
              <div className="help_section">
                <h3><u>Let us help you</u></h3>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowPopup(true); }}>
                  <p>Your Account</p>
                </a>
                <a href="/#talkus"><p>Contact Us</p></a>
                <Link href="/FAQ"><p>FAQs</p></Link>
              </div>

              <div className="policies_section">
                <h3><u>Our Policies</u></h3>
                <Link href="/TermsAndCondition"><p>Terms & Conditions</p></Link>
                <Link href="/PrivacyPolicy"><p>Privacy Policy</p></Link>
              </div>

              <div className="address_section">
                <h3><u>Address</u></h3>
                <hr />
                <div className="addresses">
                  <div className="first_address">
                    <h1>Ahmedabad branch</h1>
                    <p>5-A, Ravi Pushp Apartment,<br />Ahmedabad - 380052, Gujarat</p>
                  </div>
                  <div className="sec_address">
                    <h1>Mumbai branch</h1>
                    <p>13/4, Marine Lines, Mumbai -<br />400020, Maharashtra</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="footer">
          <p>Copyright @2025 H.Files. All rights reserved by Health Files Medico Pvt. Ltd.</p>
        </div>

        <style jsx>{`
          /* Global resets */
          :global(body) {
            margin: 0;
            padding: 0;
            font-family: "Poppins", sans-serif;
            color: #212529;
          }

          :global(html) {
            margin: 0;
            padding: 0;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          /* Header Styles */
          .header {
            font-family: "Poppins";
            background-color: #0331B5;
            color: white;
            padding: 5px 20px 5px 0px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            height: 80px;
          }

          .header img {
            width: 9rem;
            height: auto;
            margin-left: 1rem;
          }

          .hamburger {
            background: none;
            border: none;
            font-size: 28px;
            color: white;
            cursor: pointer;
            text-align: right;
          }

          .nav {
            display: none;
          }

          .active {
            display: flex !important;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            height: 75vh;
            background-color: white;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 0 0 10px 10px;
            padding: 10px 0;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .nav-links {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
          }

          .nav-links li {
            margin: 0;
          }

          .nav-links a {
            text-decoration: none;
            color: #0331B5;
            font-size: 18px;
            font-weight: bold;
            padding: 10px;
          }

          .signup {
            background-color: #FFD100;
            padding: 10px 20px;
            border-radius: 8px;
            color: #0331B5;
            font-weight: bold;
          }

          /* FAQ Main Content */
          .faq_main {
            position: relative;
            padding: 20px;
            background-color: #f8f9fa;
            min-height: 60vh;
          }

          .back-arrow-btn {
            position: absolute;
            left: 5%;
            top: 5%;
            color: gray;
            padding: 8px 20px;
            border-radius: 50px;
            border: 2px solid gray;
            cursor: pointer;
            font-weight: 700;
            font-size: 16px;
            text-decoration: none;
            background: rgba(255, 255, 255, 0.9);
            z-index: 10;
            transition: all 0.3s ease;
          }

          .back-arrow-btn:hover {
            color: #0512b9;
            border-color: #0512b9;
          }

          .content-wrapper {
            margin-top: 5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 50vh;
          }

          .content-container {
            max-width: 1000px;
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            padding: 3rem;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }

          .heading {
            font-size: 2rem;
            color: #2563eb;
            margin-bottom: 2rem;
            font-weight: 600;
            text-align: center;
          }

          .accordion-wrapper {
            width: 100%;
          }

          /* Accordion Styles */
          .accordion {
            width: 100%;
          }

          .accordion-item {
            background-color: #fff;
            border: 1px solid #e5e7eb;
            margin-bottom: 0;
          }

          .accordion-item:first-child {
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
          }

          .accordion-item:last-child {
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
          }

          .accordion-item:not(:first-child) {
            border-top: 0;
          }

          .accordion-header {
            margin-bottom: 0;
          }

          .accordion-button {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            padding: 16px 20px;
            font-size: 16px;
            color: #374151;
            text-align: left;
            background-color: #fff;
            border: 0;
            cursor: pointer;
            font-weight: 500;
            justify-content: space-between;
            transition: all 0.2s ease;
          }

          .accordion-button:hover {
            background-color: #f9fafb;
          }

          .accordion-button:not(.collapsed) {
            background-color: #dbeafe;
            color: #1d4ed8;
          }

          .accordion-button::after {
            content: '+';
            font-size: 20px;
            font-weight: 300;
            color: #6b7280;
            transition: transform 0.2s ease;
          }

          .accordion-button:not(.collapsed)::after {
            content: '−';
            color: #1d4ed8;
          }

          .accordion-collapse {
            width: 100%;
          }

          .collapse {
            display: none;
          }

          .collapse.show {
            display: block;
            border-top: 1px solid #e5e7eb;
          }

          .accordion-body {
            padding: 16px 20px;
            background-color: #ffffff;
          }

          .accordion-body strong {
            color: #000000 !important;
            font-weight: 600 !important;
            font-size: 15px !important;
            line-height: 1.5 !important;
            display: block !important;
          }

          /* Popup Styles */
          .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .popup-content {
            background: white;
            color: black;
            font-size: 14px;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            width: 300px;
            position: relative;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }

          .close-btn {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 20px;
            cursor: pointer;
          }

          /* Footer Styles */
          .footer_section {
            background-color: #0331b5;
            color: #fff;
            padding: 2rem 0;
          }

          .main_footer {
            display: flex;
            flex-direction: column;
            text-align: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }

          .logo_section {
            margin-bottom: 2rem;
          }

          .logo_section img {
            width: 11rem;
            height: auto;
            margin-bottom: 1rem;
          }

          .logo_section p {
            font-size: 16px;
            margin-bottom: 1rem;
          }

          .footer_icons h3 {
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 1rem;
          }

          .footer_icons hr {
            border: none;
            border-top: 2px solid white;
            margin: 1rem 0;
          }

          .social-icons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 1rem;
          }

          .social-icons a {
            display: flex;
            width: 45px;
            height: 45px;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            text-decoration: none;
            color: white;
            transition: transform 0.3s ease;
          }

          .social-icons a:hover {
            transform: scale(1.1);
          }

          .social-icons a:nth-child(1) {
            background: linear-gradient(315deg, #FBE18A 0.96%, #FCBB45 21.96%, #F75274 38.96%, #D53692 52.96%, #8F39CE 74.96%, #5B4FE9 100.96%);
          }

          .social-icons a:nth-child(2) {
            background-color: #1D9BF0;
          }

          .social-icons a:nth-child(3) {
            background-color: #0A66C2;
          }

          .social-icons a:nth-child(4) {
            background-color: #ff0000;
          }

          .social-icons a:nth-child(5) {
            background-color: #1877F2;
          }

          .social-icons i {
            font-size: 22px;
          }

          .footer_links {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            margin-top: 2rem;
          }

          .footer_links h3 {
            font-size: 19px;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .footer_links h3 u {
            text-decoration: underline;
            text-underline-offset: 4px;
          }

          .footer_links a {
            text-decoration: none;
            color: #fff;
            margin-bottom: 0.5rem;
            display: block;
          }

          .footer_links a:hover {
            color: #FFD100;
          }

          .footer_links p {
            font-family: Montserrat;
            color: #fff;
            margin: 0;
            line-height: 1.5;
          }

          .help_section, .policies_section, .address_section {
            display: flex;
            flex-direction: column;
          }

          .addresses {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            margin-top: 1rem;
          }

          .addresses h1 {
            font-size: 17px;
            font-weight: 500;
            margin-bottom: 0.5rem;
          }

          .addresses p {
            font-size: 14px;
            line-height: 1.4;
          }

          .address_section hr {
            border: none;
            border-top: 2px solid white;
            margin: 1rem 0;
          }

          .footer {
            background-color: #ffd100;
            display: flex;
            justify-content: center;
            font-weight: 500;
            color: rgb(53, 57, 53);
            font-size: 17px;
            text-align: center;
            padding: 15px 10px;
          }

          /* Responsive Design */
          @media (max-width: 576px) {
            .heading {
              font-size: 1.5rem;
              margin-bottom: 1.5rem;
            }

            .accordion-button {
              font-size: 15px;
              padding: 14px 16px;
            }

            .accordion-body strong {
              font-size: 14px !important;
            }

            .content-container {
              padding: 2rem 1rem;
            }

            .back-arrow-btn {
              left: 5%;
              top: 2%;
              font-size: 14px;
              padding: 6px 16px;
            }

            .header img {
              width: 8rem;
            }
          }

          @media (min-width: 768px) {
            .header img {
              width: 12rem;
            }

            .hamburger {
              display: none;
            }

            .nav {
              display: flex !important;
              margin-right: 54px;
            }

            .nav-links {
              flex-direction: row;
              gap: 47px;
              margin-left: 86px;
            }

            .nav-links a {
              color: white;
              font-size: 18px;
              font-weight: 400;
            }

            .signup {
              width: 7rem;
              font-size: 17px;
              text-align: center;
            }

            .main_footer {
              flex-direction: row;
              text-align: left;
              justify-content: space-between;
              align-items: flex-start;
            }

            .logo_section {
              width: 300px;
              margin-bottom: 0;
            }

            .footer_links {
              flex-direction: row;
              gap: 3rem;
              margin-top: 0;
              flex: 1;
              justify-content: space-around;
            }

            .footer_icons hr,
            .address_section hr {
              display: none;
            }

            .social-icons {
              justify-content: flex-start;
            }
          }

          @media (min-width: 1024px) {
            .logo_section img {
              width: 12rem;
            }

            .social-icons a {
              width: 50px;
              height: 50px;
            }

            .social-icons i {
              font-size: 26px;
            }

            .footer_links h3 {
              font-size: 21px;
            }

            .addresses h1 {
              font-size: 18px;
            }

            .addresses p {
              font-size: 16px;
            }
          }
        `}</style>
      </div>
    </>
  );
}