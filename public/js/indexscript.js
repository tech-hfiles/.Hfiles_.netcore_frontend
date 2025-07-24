

    document.addEventListener("DOMContentLoaded", function () {
        const accountLink = document.getElementById("accountLink");
        const popup = document.getElementById("helpPopup");
        const closeBtn = document.querySelector(".close-btn");

        // Open popup when clicking "Your Account"
        accountLink.addEventListener("click", function (event) {
            event.preventDefault();
            popup.style.display = "flex";
        });

        // Close popup when clicking close button
        closeBtn.addEventListener("click", function () {
            popup.style.display = "none";
        });

        // Close popup when clicking outside of it
        window.addEventListener("click", function (event) {
            if (event.target === popup) {
                popup.style.display = "none";
            }
        });
    });
    document.addEventListener("DOMContentLoaded", function () {


        const container = document.querySelector(".main_review_card");
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        if (!container || !prevBtn || !nextBtn) {
            console.error("Error: Elements not found!");
            return;
        }

        const cardWidth = document.querySelector(".review-card").offsetWidth + 20; // Adjust for margin

        // Scroll Right
        nextBtn.addEventListener("click", (e) => {
            e.preventDefault();
            container.scrollBy({ left: cardWidth, behavior: "smooth" });
        });

        // Scroll Left
        prevBtn.addEventListener("click", (e) => {
            e.preventDefault();
            container.scrollBy({ left: -cardWidth, behavior: "smooth" });
        });
    });
    document.addEventListener("DOMContentLoaded", function () {
        // Function to handle 'Read More' clicks
        function attachReadMoreEvent() {
            document.querySelectorAll(".readmore_link a").forEach(link => {
                link.addEventListener("click", function (e) {
                    e.preventDefault();

                    // Get the specific review text
                    const fullReviewText = this.getAttribute("data-full-review");


                    // Remove existing modal if present
                    const existingModal = document.querySelector(".review-modal");
                    if (existingModal) existingModal.remove();

                    // Create a new modal
                    const modal = document.createElement("div");
                    modal.classList.add("review-modal");
                    modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <p>${fullReviewText}</p>
                </div>
            `;

                    // Append modal to body
                    document.body.appendChild(modal);

                    // Close modal events
                    modal.querySelector(".close-btn").addEventListener("click", () => modal.remove());
                    modal.addEventListener("click", (event) => {
                        if (event.target === modal) modal.remove();
                    });
                });
            });
        }

        // Attach event listeners initially
        attachReadMoreEvent();

        // If new reviews are dynamically added, re-attach event listeners
        const reviewContainer = document.querySelector(".main_review_card");
        const observer = new MutationObserver(() => attachReadMoreEvent());
        observer.observe(reviewContainer, { childList: true });
    });


    document.addEventListener("DOMContentLoaded", function () {
        const accountLink = document.getElementById("accountLink");
        const popup = document.getElementById("helpPopup");
        const closeBtn = document.querySelector(".close-btn");

        // Open popup when clicking "Your Account"
        accountLink.addEventListener("click", function (event) {
            event.preventDefault();
            popup.style.display = "flex";
        });

        // Close popup when clicking close button
        closeBtn.addEventListener("click", function () {
            popup.style.display = "none";
        });

        // Close popup when clicking outside of it
        window.addEventListener("click", function (event) {
            if (event.target === popup) {
                popup.style.display = "none";
            }
        });
    });

  
   
    document.addEventListener('DOMContentLoaded', function () {
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
        const originalSetWidth = cardWidth * cards.length;

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
        container.addEventListener('mouseenter', function () {
            isPaused = true;
        });

        container.addEventListener('mouseleave', function () {
            isPaused = false;
        });

        // Handle resize to recalculate dimensions if needed
        window.addEventListener('resize', function () {
            // Recalculate card width and total width on resize
            const updatedCardWidth = cards[0].offsetWidth + 20;
            originalSetWidth = updatedCardWidth * cards.length;
        });
    });
    


   
    document.addEventListener("DOMContentLoaded", function () {
        // Get the video element after the DOM has loaded
        var video = document.getElementById("myVideo1");

        if (video) {
            // Mute the video to allow autoplay
            video.muted = true;

            // Function to play the video
            function playVideo() {
                if (video.paused) {
                    video.play();
                }
            }

            // Function to pause the video
            function pauseVideo() {
                if (!video.paused) {
                    video.pause();
                }
            }

            // Automatically play the video when the page is visible
            document.addEventListener('visibilitychange', function () {
                if (document.visibilityState === 'visible') {
                    playVideo();  // Play the video when the page is active
                } else {
                    pauseVideo(); // Pause the video when the page is hidden
                }
            });

            // You can also trigger the play/pause when the video comes into the viewport
            // Using Intersection Observer (optional)
            let videoObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        playVideo(); // Play video when it comes into the viewport
                    } else {
                        pauseVideo(); // Pause video when it leaves the viewport
                    }
                });
            }, { threshold: 0.5 });

            videoObserver.observe(video);
        } else {
            console.error("Video element with id 'myVideo1' not found.");
        }
    });
    
        document.addEventListener("DOMContentLoaded", function () {
      // Get the video element after the DOM has loaded
      var video = document.getElementById("myVideo");

        if (video) {
            // Mute the video to allow autoplay
            video.muted = true;

        // Function to play the video
        function playVideo() {
              if (video.paused) {
            video.play();
              }
          }

        // Function to pause the video
        function pauseVideo() {
              if (!video.paused) {
            video.pause();
              }
          }

        // Automatically play the video when the page is visible
        document.addEventListener('visibilitychange', function () {
              if (document.visibilityState === 'visible') {
            playVideo();  // Play the video when the page is active
              } else {
            pauseVideo(); // Pause the video when the page is hidden
              }
          });

          // You can also trigger the play/pause when the video comes into the viewport
          // Using Intersection Observer (optional)
          let videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    playVideo(); // Play video when it comes into the viewport
                } else {
                    pauseVideo(); // Pause video when it leaves the viewport
                }
            });
          }, {threshold: 0.5 });

        videoObserver.observe(video);
      } else {
            console.error("Video element with id 'myVideo' not found.");
      }
        });
   
    document.addEventListener("DOMContentLoaded", function () {
        const menuToggle = document.getElementById("menu-toggle");
        const navMenu = document.getElementById("nav-menu");
        const navLinks = document.querySelectorAll(".nav-links a");

        menuToggle.addEventListener("click", () => {
            if (navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
                navMenu.classList.add("closing");

                // Wait for animation to finish before hiding
                setTimeout(() => {
                    navMenu.classList.remove("closing");
                    navMenu.style.display = "none"; // Hide the menu after animation
                }, 400);
            } else {
                navMenu.style.display = "flex"; // Show menu before animation
                navMenu.classList.remove("closing");
                navMenu.classList.add("active");
            }
        });

        document.addEventListener("click", (event) => {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                if (navMenu.classList.contains("active")) {
                    navMenu.classList.remove("active");
                    navMenu.classList.add("closing");

                    setTimeout(() => {
                        navMenu.classList.remove("closing");
                        navMenu.style.display = "none";
                    }, 400);
                }
            }
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                navMenu.classList.add("closing");

                setTimeout(() => {
                    navMenu.classList.remove("closing");
                    navMenu.style.display = "none";
                }, 400);
            });
        });
    });




