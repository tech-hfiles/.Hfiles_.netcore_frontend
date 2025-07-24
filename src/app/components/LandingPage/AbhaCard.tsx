'use client';
import React from 'react';
import Image from 'next/image';

export default function AbhaCard() {
  return (
    <section className="abha-section">
      <div className="main_abha_card">

        {/* Left Text Section */}
        <div className="container">
          <div className="abha-content">

            <div className="abha_header">
              <h2>Create Your ABHA Health ID Card Today</h2>
              <hr className="separator" />
              <p>
                Join India's digital health revolution by making your ABHA 
                (Ayushman Bharat Health Account) Health ID card!
              </p>
            </div>

            <ul className="abha-benefits">
              <li>
                <i className="abha_righticon fas fa-check-circle"></i>
                Establish a unique identity with healthcare providers
              </li>
              <li>
                <i className="abha_righticon fas fa-check-circle"></i>
                Link all healthcare benefits to your unique ABHA number
              </li>
              <li>
                <i className="abha_righticon fas fa-check-circle"></i>
                Avoid registration queues in healthcare facilities across the country
              </li>
            </ul>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="abha-image-container1">
          <img
            // src="https://hfiles.in/wp-content/uploads/2022/12/user-profile-screen.png"
            src="/user-profile-screen.png"
            alt="ABHA Health ID by Health Files"
            width={600}
            height={500}
            className="abha-card-image"
          />
        </div>

      </div>
    </section>
  );
}
