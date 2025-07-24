'use client';

import React from 'react';
import Image from 'next/image';
// Adjust path if needed

export default function RecognizedSection() {
  return (
    <section className="recognized-section">
      <div className="main-recognized">
        <div className="image-wrapper1">
          <h3>Recognized Under</h3>
          <img
            src="/journal-page-images/article/Recognized.jpeg"
            alt="Recognized Under Image"
            width={300}
            height={200}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="image-wrapper2">
          <h3>Active Integrator</h3>
          <div className="image-flex">
            <img
              src="/journal-page-images/article/Active.jpeg"
              alt="Active Integrator Image 1"
              width={300}
              height={200}
              loading="lazy"
              decoding="async"
            />
            <img
              src="/journal-page-images/article/Active2.jpeg"
              alt="Active Integrator Image 2"
              width={300}
              height={200}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
