'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';

const articles = [
  {
    title: 'Oral Hygiene Tips for Seniors: What You Need',
    description: `Oral health isn't just about sparkling teeth—it's your ticket to staying healthy and feeling...`,
    reviewer: 'Dr. Jeet Dalal',
    date: '27 January, 25',
    img: '/journal-page-images/article/article44.jpeg',
    href: 'https://localhost:7228/articles/oral-hygiene-tips-for-seniors-what-you-need-to-know/',
  },
  {
    title: '7 Healthy Habits That Can Improve Your Digestion',
    description: `Good digestion is important for feeling good but many of us don't pay attention to habits that...`,
    reviewer: 'Hena Kanakia',
    date: '20 July, 24',
    img: '/journal-page-images/article/article22.jpeg',
    href: 'https://localhost:7228/articles/7-healthy-habits-that-can-improveyour-digestion/',
  },
  {
    title: 'What Science Says About Feeding Animals...',
    description: `As pet parents, we all want the best for our furry (or feathered or scaly) family members. But...`,
    reviewer: 'Anjali',
    date: '12 December, 24',
    img: '/journal-page-images/article/article33.jpeg',
    href: 'https://localhost:7228/articles/oral-hygiene-tips-for-seniors-what-you-need-to-know/',
  },
];

export default function Articles() {
  useEffect(() => {
    // Get the elements
    const container = document.querySelector('.article-cards-container');
    const cards = Array.from(document.querySelectorAll('.article_card'));
    
    if (!container || cards.length === 0) {
      console.error('Required elements not found');
      return;
    }

    // Clear any existing clones to start fresh
    container.innerHTML = '';
    
    // Add the original cards back to the container
    cards.forEach(card => {
      container.appendChild(card);
    });

    // Clone enough sets of cards to ensure no glitches
    // We need at least 2 complete sets of clones for seamless looping
    for (let i = 0; i < 3; i++) {
      cards.forEach(card => {
        const clone = card.cloneNode(true);
        container.appendChild(clone);
      });
    }

    // Calculate dimensions
    const cardWidth = cards[0].offsetWidth + 20; // Card width + gap
    let originalSetWidth = cardWidth * cards.length;

    // Style the container for smooth scrolling
    container.style.display = 'flex';

    // Set up variables for scrolling
    let currentPosition = 0;
    let animationId = null;
    let isPaused = false;

    // The main scroll function
    function smoothScroll() {
      if (isPaused) {
        animationId = requestAnimationFrame(smoothScroll);
        return;
      }

      // Move the container left for scrolling effect
      currentPosition -= 0.5; // Adjust speed as needed

      // Handle the reset point - the key to eliminating the glitch
      if (Math.abs(currentPosition) >= originalSetWidth) {
        // Reset position perfectly at the set boundary
        currentPosition = currentPosition % originalSetWidth;
        // Apply the reset instantly without animation to avoid any visible jump
        container.style.transition = 'none';
        container.style.transform = `translateX(${currentPosition}px)`;
        // Force a reflow to make the transition removal take effect immediately
        void container.offsetWidth;
        // Re-enable the smooth transition
        container.style.transition = 'transform 0.01s linear';
      } else {
        // Normal scrolling
        container.style.transform = `translateX(${currentPosition}px)`;
      }

      animationId = requestAnimationFrame(smoothScroll);
    }

    // Initialize scroll
    container.style.transition = 'transform 0.01s linear';
    animationId = requestAnimationFrame(smoothScroll);

    // Handle pause on hover
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Handle resize to recalculate dimensions if needed
    const handleResize = () => {
      // Recalculate card width and total width on resize
      const updatedCardWidth = cards[0].offsetWidth + 20;
      originalSetWidth = updatedCardWidth * cards.length;
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove event listeners and stop animation
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array means this effect runs once after component mounts

  return (
    <section className="article_section">
      <div className="main_article">
        <div className="article_header">
          <h2>Articles Library</h2>
          <hr />
        </div>

        <div className="articles_row">
          <div className="article-cards-container">
            {articles.map((article, index) => (
              <div className="article_card" key={index}>
                <img
                  className="article_image"
                  src={article.img}
                  alt="Article Image"
                  width={600}
                  height={400}
                />
                <div className="article_content">
                  <a href={article.href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <div className="article_title">
                      <h1>{article.title}</h1>
                      <p>{article.description}</p>
                    </div>
                    <span> Reviewed by</span>
                    <div className="footer_of_article_content">
                      <p>{article.reviewer}</p>
                      <p>{article.date}</p>
                    </div>
                    <hr className="lower_hr" />
                    <p className="readmore">Read more . . .</p>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}