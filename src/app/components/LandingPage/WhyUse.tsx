import React from 'react';
import Image from 'next/image';

export default function WhyUse() {
  return (
    <section className="whyuse-section" id="why">
      <div className="main_second_slide">

        {/* Header Text */}
        <div className="whyuse-header">
          <h2>Why use Health Files?</h2>
          <p>
            One secure health file profile can replace all physical copies of your medical history. Update your bond with health by signing up with us today!
          </p>
        </div>

        {/* Mockup Image */}
   <div className="secound_slide_image" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  <img
    src="/journal-page-images/article/pixelcut-export-mockup.png"
    alt="Why Use Health Files"
    width={1200}
    height={100}
    className="whyuse-mockup"
  />
</div>

        {/* Features Grid */}
        <div className="whyuse-container">
          {/* Row 1 */}
          <div className="whyuse-features">
            <FeatureCard
              src="/journal-page-images/article/secure-storage.png"
              alt="Secure Storage"
              title="Secure Document Storage"
              desc="Your data is secured and safely stored on a cloud storage"
            />
            <FeatureCard
              src="/journal-page-images/article/family-health.png"
              alt="Family Management"
              title="Family Health Management"
              desc="Effortlessly manage and access medical records for the whole family"
            />
          </div>

          {/* Row 2 */}
          <div className="whyuse-features">
            <FeatureCard
              src="/journal-page-images/article/easy-access.png"
              alt="Easy Access"
              title="Easy Access and Sharing"
              desc="View, download, or share your medical files anytime and anywhere"
            />
            <FeatureCard
              src="/journal-page-images/article/track-history.png"
              alt="Track History"
              title="Track Medical History Easily"
              desc="Keep a comprehensive history of diagnoses, treatments, and prescriptions"
            />
          </div>

          {/* Row 3 */}
          <div className="whyuse-features">
            <FeatureCard
              src="/journal-page-images/article/time-saving.png"
              alt="Time-Saving"
              title="Time-Saving Digital Solution"
              desc="Access your records instantly, saving time and avoiding the hassle of sifting through documents"
            />
            <FeatureCard
              src="/journal-page-images/article/abha-id.png"
              alt="ABHA ID"
              title="Create ABHA ID and Analyze your Health Records"
              desc="COMING SOON!"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

type FeatureCardProps = {
  src: string;
  alt: string;
  title: string;
  desc: string;
};

function FeatureCard({ src, alt, title, desc }: FeatureCardProps) {
  return (
    <div className="feature-card">
      <img src={src} alt={alt} width={64} height={64} />
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
