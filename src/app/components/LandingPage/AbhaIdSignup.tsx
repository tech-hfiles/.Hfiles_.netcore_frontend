'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AbhaIdSignup() {
  const router = useRouter();

  return (
    <section className="abha-id-section">
      <div className="just_for_desktop">

        {/* Left Image */}
        <div className="main_abha_idcard">

          <div className="floating-card signup-card">
            <img
              src="/journal-page-images/article/signupabhaid.png"
              alt="ABHA Health ID by Health Files"
              width={300}
              height={200}
              className="signup-icon"
            />
          </div>

          {/* Right Content */}
          <div className="abha-content-Id">
            <div className="abha-content-box">

              <div className="abha-content-id-header">
                <h2>Create your ABHA ID</h2>
                <p>The Indian healthcare system is going digital.</p>
              </div>

              <p className="abha_sub_text">
                Join us in our mission by signing up with Health Files and creating your ABHA ID today!
              </p>

              <div className="create_abha_button">
                <div className="comming_soon_alignment">
                  <div className="abha_id_button">
                    <button
                      className="abha-button"
                      onClick={() => window.open('/Create-Abha-Card', '_blank')}
                    >
                      <span>Create your ABHA ID</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ayushman Icon */}
              <div className="ayushman-badge">
                <img
                  src="/journal-page-images/article/AyushmanBharat.png"
                  alt="Ayushman Bharat Badge"
                  width={100}
                  height={60}
                  className="ayushman-icon"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
