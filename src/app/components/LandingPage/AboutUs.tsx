import React from 'react';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <section id="about_us_section" className="about-section">
      <div className="main_about_us">
        
        {/* About Content: Image + Text */}
        <div className="about-content">
          {/* Image */}
          <img
            className="desktop_image_aboutus"
            src="/journal-page-images/article/about_us_short.png"
            alt="About Us"
            width={600}
            height={400}
          />

          {/* Text */}
          <div className="about-text">
            <h2>About Us</h2>
            <hr className="separator1" />
            <p>
              Welcome to Hfiles, where we aim to simplify and manage the healthcare system for your entire family,
              from birth to adulthood. We believe that organization is the key to leading a successful life, and
              our mission is to help you organize your medical life into one neat file.
            </p>
            <p>
              We understand that visiting a doctor can be a stressful experience, and it can be even more challenging
              to keep track of past prescriptions, medical records, and medications. With Hfiles, you no longer have
              to worry about these issues as we help manage this stress by maintaining all of your prescriptions,
              medical records, and history in one place.
            </p>
            <p>
              Our system is designed to facilitate easy transfer and access to medical files, so you can be confident
              that your family's health information is always up-to-date and readily available to you and your
              healthcare providers. We prioritize the security and privacy of your sensitive medical information, and
              use the latest technology to ensure that your data is safe and protected at all times.
            </p>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="mission_vision">
          <div className="mission">
            <h2>Mission</h2>
            <hr className="separator2" />
            <p>
              To streamline the process of managing medical records from birth to old age, ensuring that your family's
              health information is organized, easily accessible and can be shared effortlessly when you need it the
              most. With our support, you can focus on what matters most - taking care of your family's health - while
              we take care of the rest.
            </p>
            <p>Join us on this mission to transform the way you manage your family's medical life.</p>
          </div>

          <div className="vision">
            <h2>Vision</h2>
            <hr className="separator3" />
            <p>
              To create a social healthcare network that connects families and healthcare professionals seamlessly.
              To build a global health community where individuals can share experiences and empower each other
              to lead healthier lives.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
