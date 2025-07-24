'use client';
import React, { JSX, useEffect, useRef } from 'react';

export default function HowItWorks(): JSX.Element {
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const setupVideoControls = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
      const video = videoRef.current;
      if (!video) return null;

      // Mute the video to allow autoplay
      video.muted = true;

      // Function to play the video
      const playVideo = (): void => {
        if (video.paused) {
          video.play().catch(error => {
            console.error('Error playing video:', error);
          });
        }
      };

      // Function to pause the video
      const pauseVideo = (): void => {
        if (!video.paused) {
          video.pause();
        }
      };

      // Handle page visibility changes
      const handleVisibilityChange = (): void => {
        if (document.visibilityState === 'visible') {
          playVideo(); // Play the video when the page is active
        } else {
          pauseVideo(); // Pause the video when the page is hidden
        }
      };

      // Set up Intersection Observer
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            playVideo(); // Play video when it comes into the viewport
          } else {
            pauseVideo(); // Pause video when it leaves the viewport
          }
        });
      }, { threshold: 0.5 });

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      videoObserver.observe(video);

      // Return cleanup function
      return (): void => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        videoObserver.unobserve(video);
        videoObserver.disconnect();
      };
    };

    // Setup controls for both videos
    const cleanupDesktop = setupVideoControls(desktopVideoRef);
    const cleanupMobile = setupVideoControls(mobileVideoRef);

    // Cleanup function
    return (): void => {
      if (cleanupDesktop) cleanupDesktop();
      if (cleanupMobile) cleanupMobile();
    };
  }, []);

  return (
    <section className="health-files-section">
      <div className="main_video_section">
        
        {/* Header Section */}
        <div className="video_section_header">
          <div className="section-header">
            <h2 className="section-title">How does Health Files Work?</h2>
            <p className="section-subtitle">
              Sign up easily in just a few steps to securely manage your health records 
              and take control of your healthcare journey with confidence.
            </p>
          </div>
        </div>

        {/* Video + Steps */}
        <div className="content">
          
          {/* Video Section */}
          <div className="video-container">
            {/* Desktop Video */}
            <div className="videodesktop" style={{ width:'100%'}}>
              <video
                ref={desktopVideoRef}
                id="myVideo"
                className="desktop_final_video"
                controls
                poster="/video_desktopview.jpeg"
              >
                <source src="/journal-page-images/article/Welcome to Health Files.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Mobile Video */}
            <div className="videomobile hidden">
              <video
                ref={mobileVideoRef}
                id="myVideo1"
                className="mobile_final_video"
                controls
                poster="/video_mobileView.jpeg"
              >
                <source src="/journal-page-images/article/phoneview.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Step-by-step Instructions */}
          <div className="all_steps">
            <div className="steps">
              <div className="step">
                <h3 className="step-title">Step 1</h3>
                <p className="step-description">Sign up and create a profile for you. Add your family members.</p>
              </div>
              <div className="step">
                <h3 className="step-title">Step 2</h3>
                <p className="step-description">Securely upload medical records and organize them for easy access.</p>
              </div>
              <div className="step">
                <h3 className="step-title">Step 3</h3>
                <p className="step-description">Grant your family access to records anytime and seamlessly share them with your healthcare providers.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}