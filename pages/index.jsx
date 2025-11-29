import Head from 'next/head';
import { getAllStates } from '../utils/data.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import InteractiveMap from '../components/InteractiveMap.jsx';
import ChatBot from '../components/ChatBot.jsx';
import InfiniteCarousel from '../components/InfiniteCarousel.jsx';
import { useState, useEffect } from 'react';

export default function Home({ states }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Show message function for feedback form
    function showMessage(messageElement, text, type) {
      // Safety check to prevent errors when element doesn't exist
      if (messageElement) {
        let classes = 'feedback-message show ';
        if (type === 'error') {
          classes += 'error';
        } else if (type === 'success') {
          classes += 'success';
        } else {
          classes += 'info';
        }
        messageElement.className = classes;
        messageElement.textContent = text;
      }
      
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = `notification-toast ${type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'}`;
      toast.innerHTML = `
        <div class="notification-content">
          <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
          <span class="notification-message">${text}</span>
        </div>
        <button class="notification-close">&times;</button>
      `;
      document.body.appendChild(toast);
      
      // Add close functionality
      toast.querySelector('.notification-close').addEventListener('click', () => {
        toast.remove();
      });
      
      // Auto-hide success messages after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          if (messageElement) {
            messageElement.classList.remove('show');
          }
          if (toast.parentNode) {
            toast.remove();
          }
        }, 5000);
      } else {
        // Auto-hide error/info messages after 8 seconds
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 8000);
      }
    }
    
    // Add event listener for feedback form submission
    const handleFeedbackSubmit = async (e) => {
      e.preventDefault();
      
      const form = e.target;
      const formData = new FormData(form);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      
      const feedbackMessage = document.getElementById('feedbackResult');
      
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, message }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          showMessage(feedbackMessage, 'Thank you for your feedback!', 'success');
          form.reset();
        } else {
          showMessage(feedbackMessage, result.error || 'Failed to submit feedback. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error submitting feedback:', error);
        showMessage(feedbackMessage, 'Failed to submit feedback. Please try again.', 'error');
      }
    };
    
    // Add event listener when component mounts
    if (isClient) {
      const feedbackForm = document.getElementById('feedbackForm');
      if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
      }
      
      // Initialize photo upload form
      initializePhotoUploadForm(states);
      
      // Cleanup event listener when component unmounts
      return () => {
        if (feedbackForm) {
          feedbackForm.removeEventListener('submit', handleFeedbackSubmit);
        }
      };
    }
  }, [states, isClient]);

  const populateHighlights = (states) => {
    // Select featured destinations (all 8 states)
    return states.slice(0, 8);
  };

  const populateStatesList = (states) => {
    return states;
  };

  // Initialize photo upload form functionality
  const initializePhotoUploadForm = (statesData) => {
    if (typeof window === 'undefined') return;
    
    const photoUploadForm = document.getElementById('photoUploadForm');
    const uploadMessage = document.getElementById('uploadMessage');
    
    if (!photoUploadForm) return;
    
    // Handle form submission
    photoUploadForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const citySlug = formData.get('citySelect');
      const photoInput = document.getElementById('photoInput');
      const photo = photoInput.files[0];
      
      if (!citySlug) {
        showMessage(uploadMessage, 'Please select a city', 'error');
        return;
      }
      
      if (!photo) {
        showMessage(uploadMessage, 'Please select a photo to upload', 'error');
        return;
      }
      
      // Validate file size (5MB max)
      if (photo.size > 5 * 1024 * 1024) {
        showMessage(uploadMessage, 'Image size must be less than 5MB', 'error');
        return;
      }
      
      // Validate file type - only allow jpg and png
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(photo.type)) {
        showMessage(uploadMessage, 'Only jpg and png file formats are allowed', 'error');
        return;
      }
      
      try {
        showMessage(uploadMessage, 'Uploading...', 'info');
        
        const uploadFormData = new FormData();
        uploadFormData.append('photo', photo);
        uploadFormData.append('citySlug', citySlug);
        uploadFormData.append('caption', formData.get('caption') || '');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          showMessage(uploadMessage, 'Photo uploaded successfully! It will be visible after admin approval.', 'success');
          photoUploadForm.reset();
        } else {
          showMessage(uploadMessage, result.error || 'Upload failed', 'error');
        }
      } catch (error) {
        console.error('Upload error:', error);
        showMessage(uploadMessage, 'Upload failed. Please try again.', 'error');
      }
    });
  };

  return (
    <div>
      <Head>
        <title>Discover NorthEast India - Explore the Unexplored</title>
        <meta name="description" content="Discover the beauty of NorthEast India - explore 8 states with unique cultures, breathtaking landscapes, and rich heritage" />
      </Head>

      {/* Navigation Header */}
      <header className="main-header">
        <nav className="navbar" role="navigation" aria-label="Main navigation">
          <div className="container">
            <div className="nav-brand">
              <h1 className="logo" onClick={() => window.location.href = '/'}>Discover NorthEast</h1>
            </div>
            <ul className="nav-menu">
              <li><a href="/" className="active">Home</a></li>
              <li><a href="#states">States</a></li>
              <li><a href="#highlights">Highlights</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="/admin" className="admin-link">Admin</a></li>
            </ul>
            <button className="nav-toggle" aria-label="Toggle navigation">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>
      </header>

      {/* Enhanced Hero Section with Modern Slideshow */}
      <section className="hero-section" aria-label="Featured destinations slideshow">
        <div id="heroSlideshow" className="hero-slideshow">
          <HeroSlider slides={[]} />
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="map-section" id="states">
        <div className="container">
          <div className="section-header">
            <h2>Explore NorthEast States</h2>
            <p>Click on any state to discover its unique attractions</p>
          </div>
          <div className="map-container">
            <div id="homeMap" className="interactive-map" aria-label="Interactive map of NorthEast India">
              <InteractiveMap type="overview" data={{ states }} />
            </div>
            {/* Fallback List for Mobile/Accessibility */}
            <div className="states-list-fallback" id="statesListFallback">
              <h3>Select a State:</h3>
              <ul className="states-grid" role="list">
                {/* Will be populated dynamically */}
                {populateStatesList(states).map(state => (
                  <li key={state.slug}>
                    <a href={`/state/${state.slug}`} className="state-link">
                      <span className="state-icon">🏛️</span>
                      <span className="state-name">{state.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Grid Section */}
      <section className="highlights-section" id="highlights">
        <div className="container">
          <div className="section-header">
            <h2>Popular Destinations</h2>
            <p>Discover the most visited places in NorthEast India</p>
          </div>
          <div className="highlights-grid" id="highlightsGrid">
            {/* Render regular state cards first (first 6 states) */}
            {populateHighlights(states).slice(0, 6).map((state, index) => (
              <div 
                key={state.slug} 
                className="state-card"
                onClick={() => window.location.href = `/state/${state.slug}`}
              >
                <div className="card-badge state-badge">State</div>
                <img src={state.featuredImages?.[0] || '/assets/placeholder.jpg'} 
                     alt={state.name} 
                     onError={(e) => e.target.src = '/assets/placeholder.jpg'} />
                <div className="state-card-content">
                  <h3>{state.name}</h3>
                  <p>{state.description?.substring(0, 100) + '...'}</p>
                  <span className="card-link">Explore State →</span>
                </div>
              </div>
            ))}
            
            {/* Special handling for Sikkim and Tripura cards in a single line */}
            <div className="special-states-container">
              <div className="state-sikkim">
                <div 
                  className="state-card special-state-card"
                  onClick={() => window.location.href = `/state/sikkim`}
                >
                  <div className="card-badge state-badge">State</div>
                  <img src={states.find(s => s.slug === 'sikkim')?.featuredImages?.[0] || '/assets/placeholder.jpg'} 
                       alt="Sikkim" 
                       onError={(e) => e.target.src = '/assets/placeholder.jpg'} />
                  <div className="state-card-content">
                    <h3>Sikkim</h3>
                    <p>{states.find(s => s.slug === 'sikkim')?.description?.substring(0, 100) + '...'}</p>
                    <span className="card-link">Explore State →</span>
                  </div>
                </div>
              </div>
              <div className="state-tripura">
                <div 
                  className="state-card special-state-card"
                  onClick={() => window.location.href = `/state/tripura`}
                >
                  <div className="card-badge state-badge">State</div>
                  <img src={states.find(s => s.slug === 'tripura')?.featuredImages?.[0] || '/assets/placeholder.jpg'} 
                       alt="Tripura" 
                       onError={(e) => e.target.src = '/assets/placeholder.jpg'} />
                  <div className="state-card-content">
                    <h3>Tripura</h3>
                    <p>{states.find(s => s.slug === 'tripura')?.description?.substring(0, 100) + '...'}</p>
                    <span className="card-link">Explore State →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section - New UI/UX for "Why Visit NorthEast India?" */}
      <section className="premium-features-section">
        <div className="container">
          <div className="premium-features-header">
            <h2>Why Visit NorthEast India?</h2>
            <p>Discover a region of unparalleled natural beauty, rich cultural heritage, and unforgettable experiences that will leave you enchanted</p>
          </div>
          
          <InfiniteCarousel />
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer" id="contact">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Contact Us</h3>
              <p>Email: <a href="mailto:info@discovernortheast.com">info@discovernortheast.com</a></p>
              <p>Phone: +91 98765 43210</p>
              <p>Follow us on social media for updates!</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#states">Explore States</a></li>
                <li><a href="#highlights">Popular Places</a></li>
                <li><a href="/admin">Admin Portal</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Feedback</h3>
              <form id="feedbackForm" className="feedback-form">
                <input type="text" id="feedbackName" name="name" placeholder="Your Name" required aria-label="Your name" />
                <input type="email" id="feedbackEmail" name="email" placeholder="Your Email" required aria-label="Your email" />
                <textarea id="feedbackMessage" name="message" placeholder="Your Message" required aria-label="Your message" rows="4"></textarea>
                <button type="submit" className="btn btn-primary">Send Feedback</button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Discover NorthEast. Made with ❤️ for Hackathon</p>
            <p className="footer-disclaimer">This website is for educational purposes only. All images are for demonstration.</p>
          </div>
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}

// Fetch data at build time
export async function getStaticProps() {
  try {
    const states = await getAllStates();
    
    return {
      props: {
        states,
      },
      revalidate: 60, // Revalidate at most once per minute
    };
  } catch (error) {
    console.error('Failed to fetch states:', error);
    return {
      props: {
        states: [],
      },
    };
  }
}