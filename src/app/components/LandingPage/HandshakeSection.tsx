
'use client';
import React from 'react';
import Image from 'next/image';
export default function HandshakeSection() {
  const handleGetInTouch = () => {
    window.open(
      'https://mail.google.com/mail/?view=cm&fs=1&to=contact@hfiles.in&su=Inquiry&body=Hello, I have a question...',
      '_blank'
    );
  };

  return (
    <section className="handshake_section">
      <div className="main_handshake">
        <div className="handshake1">
          <img
            loading="lazy"
            decoding="async"
            src="/journal-page-images/article/landing-handshake.png"
            alt="Health Files Logo"
          />
          <div className="handshakecontent">
            <p>
              Ready to make a difference in healthcare? Join our team and help shape the future of
              health management!
            </p>
            <button className="gat_in_touch" onClick={handleGetInTouch}>
              <span>GET IN TOUCH</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
