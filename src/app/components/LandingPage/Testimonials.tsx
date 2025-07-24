'use client';
import React, { useRef, useState, useEffect } from 'react';
 // Adjust path as needed

const testimonials = [
  {
    name: 'Dr. Ekta',
    location: 'Mumbai, India',
    summary: `Being a healthcare professional myself and a mom to my child and my puppy, it has really helped my husband and I to streamline our process...`,
    full: `Being a healthcare professional myself and a mom to my child and my puppy, it has really helped my husband and I to streamline our process of data management. No more 35 missed calls and messages to coordinate where our records are when either of us takes our pet to the vet.`,
  },
  {
    name: 'Vinit D',
    location: 'Mumbai, India',
    summary: `Being a user of HFiles, I can safely say maintaining my family health data, reports and history has never been more convenient...`,
    full: `Being a user of HFiles, I can safely say maintaining my family health data, reports and history has never been more convenient. The ease of access of data and sharing it with necessary professionals AT THE CORRECT time has never been easier!`,
  },
  {
    name: 'Dr. Shetty',
    location: 'Mumbai, India',
    summary: `Being a working professional and newly married it's been so helpful during my pregnancy...`,
    full: `Being a working professional and newly married it's been so helpful during my pregnancy because my husband and I as well as my family all have access to my reports and it helps us remain stress free about reports and prescriptions.`,
  },
  {
    name: 'Dr. Sanjana',
    location: 'Mumbai, India',
    summary: `This Website is incredibly helpful! H files allows me to keep all my family's medical records in one place...`,
    full: `This Website is incredibly helpful! H files allows me to keep all my family's medical records in one place. No more hunting for documents during emergencies.`,
  },
  {
    name: 'Akshay Tondon',
    location: 'Newcastle, UK',
    summary: `HFiles is a highly effective app for securely organizing and storing medical documents...`,
    full: `HFiles is a highly effective app for securely organizing and storing medical documents. Its user-friendly interface makes it simple to upload, categorize, and manage files like prescriptions, lab results, and insurance forms.`,
  },
  {
    name: 'Jenita Soni',
    location: 'Mumbai, India',
    summary: `As new parents, it was so important that my husband and I have all our important medical records in one place...`,
    full: `As new parents, it was so important that my husband and I have all our important medical records in one place including our son's vaccination records. Health files has helped us in doing exactly that in an organised manner with ease of access!`,
  },
];

const Testimonials = () => {
  const containerRef = useRef(null);
  const cardWidthRef = useRef(0);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const card = document.querySelector('.review-card');
    if (card) {
      cardWidthRef.current = card.offsetWidth + 20;
    }
  }, []);

  const scroll = (dir: string) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({
      left: dir === 'left' ? -cardWidthRef.current : cardWidthRef.current,
      behavior: 'smooth',
    });
  };

  return (
    <div className="testimonial_section">
      <div className="main_testimonial">
        <div className="testimonial_header">
          <h2>What People Are Saying</h2>
        </div>

        <div className="review-container">
          <button id="prevBtn" onClick={() => scroll('left')} className="left-arrow">&#10094;</button>

          <div className="main_review_card" ref={containerRef}>
              {testimonials.map((review, index) => (
                <div className="review-card" key={index}>
                  <div className="review_text">
                    <p style={{textAlign:'left'}}>{review.summary}</p>
                  </div>
                  <div className="readmore_link">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedReview(review);
                      }}
                    >
                      Read More
                    </a>
                  </div>
                  <div className="review_footer">
                    <div className="name_part">
                      <span>-</span>
                      <h2>{review.name}</h2>
                    </div>
                    <p>{review.location}</p>
                  </div>
                </div>
              ))}
            </div>

          <button id="nextBtn" onClick={() => scroll('right')} className="left-arrow">&#10095;</button>
        </div>

        {selectedReview && (
        <div className="review-modal" onClick={() => setSelectedReview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setSelectedReview(null)}>&times;</span>
            <p style={{textAlign:'left'}}>{selectedReview.full}</p>
            <p className="reviewer-name" style={{textAlign:'left',marginTop:'49px'}}>- {selectedReview.name}</p>
            <p className="reviewer-location" style={{textAlign:'left',color:'#ffd100'}}>{selectedReview.location}</p>
          </div>
        </div>
      )}
         

      </div>
    </div>
  );
};

export default Testimonials;