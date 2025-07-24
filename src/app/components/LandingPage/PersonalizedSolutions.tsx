import React from 'react';
import Image from 'next/image';

export default function PersonalizedSolutions() {
  return (
    <section className="personalized_solutions_section">
      <div className="main_solution">

        {/* Desktop layout */}
        <div className="solution_desktop">

          {/* Text Header */}
          <div className="solution_header">
            <div className="solution_title">
              <h2 className="personalized">Personalized Health</h2>
              <h2 className="solution">Solutions</h2>
              <p>Enterprise and Organizations</p>
            </div>

            {/* Subtext */}
            <div className="solution_sub_text">
              <p className="tailored">
                Tailored solutions designed to meet your organization's needs and goals.
              </p>
            </div>

            {/* Button (desktop) */}
            <div className="desktop_solution_id_button">
              <a className="solution_button" href="#talkus">
                <span>Contact Us</span>
              </a>
            </div>
          </div>

          {/* Image */}
          <img
            className="main_solution_image solution_image"
            src="/journal-page-images/article/personalized.png"
            alt="Personalized Health Solutions by Health Files"
            width={600}
            height={400}
          />
        </div>

        {/* Fallback button for non-desktop views */}
        <div className="solution_id_button">
          <a className="solution_button" href="#talkus">
            <span>Contact Us</span>
          </a>
        </div>
      </div>
    </section>
  );
}
