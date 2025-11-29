import Head from 'next/head';
import { getCity } from '../../utils/data.jsx';
import HeroSlider from '../../components/HeroSlider.jsx';
import InteractiveMap from '../../components/InteractiveMap.jsx';
import { useState, useEffect } from 'react';

export default function CityPage({ city }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Initialize photo upload form
    const initializePhotoUploadForm = () => {
      if (typeof window === 'undefined') return;
      
      // Handle sidebar form
      const photoUploadForm = document.getElementById('photoUploadForm');
      const uploadMessage = document.getElementById('uploadMessage');
      
      if (photoUploadForm) {
        // Handle form submission
        photoUploadForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const citySlug = city.slug; // Use the current city slug directly
          const photoInput = document.getElementById('photoInput');
          const photo = photoInput.files[0];
          const caption = formData.get('caption') || '';
          
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
            uploadFormData.append('caption', caption);
            
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
      }
      
      // Handle feedback form
      const feedbackForm = document.getElementById('cityFeedbackForm');
      const feedbackMessage = document.getElementById('cityFeedbackResult');
      
      if (feedbackForm) {
        feedbackForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const form = e.target;
          const formData = new FormData(form);
          const name = formData.get('name');
          const email = formData.get('email');
          const message = formData.get('message');
          
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
        });
      }
    };

    // Show message function
    function showMessage(messageElement, text, type) {
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
          messageElement.classList.remove('show');
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

    // Initialize the form when component mounts
    if (isClient) {
      initializePhotoUploadForm();
    }
  }, [city, isClient]);

  if (!city) return <div>City not found</div>;

  return (
    <div>
      <Head>
        <title>{`${city.name} - Discover NorthEast India`}</title>
        <meta name="description" content={`Explore ${city.name}'s attractions, culture and heritage in ${city.stateName}`} />
      </Head>

      {/* Navigation Header */}
      <header className="main-header">
        <nav className="navbar" role="navigation" aria-label="Main navigation">
          <div className="container">
            <div className="nav-brand">
              <h1 className="logo" onClick={() => window.location.href = '/'}>Discover NorthEast</h1>
            </div>
            <ul className="nav-menu">
              <li><a href="/">Home</a></li>
              <li><a href="/#states">States</a></li>
              <li><a href="/#highlights">Highlights</a></li>
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

      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li><a href="/">Home</a></li>
            <li><span className="breadcrumb-separator">/</span></li>
            <li><a href={`/state/${city.stateSlug}`}>{city.stateName}</a></li>
            <li><span className="breadcrumb-separator">/</span></li>
            <li><span>{city.name}</span></li>
          </ol>
        </div>
      </nav>

      {/* Enhanced Hero Section with Modern Slideshow */}
      <section className="hero-section" aria-label="Featured city images">
        <div id="heroSlideshow" className="hero-slideshow">
          <HeroSlider slides={city.featuredImages?.map((img, index) => ({
            image: img,
            alt: `${city.name} - Image ${index + 1}`,
            title: city.name,
            subtitle: index === 0 ? `Welcome to ${city.name}` : `Discover ${city.name}`,
            description: city.tagline || `Explore the beauty and culture of ${city.name}`
          })) || []} />
        </div>
      </section>

      {/* City Information */}
      <section className="city-info-section">
        <div className="container">
          <div className="info-grid">
            {/* Main Content */}
            <div className="info-card">
              <h2>About {city.name}</h2>
              <div>
                <p>{city.summary}</p>
              </div>
            </div>

            {/* Historical Details */}
            <div className="info-card">
              <h2>History & Heritage</h2>
              <div>
                <p>{city.history}</p>
              </div>
            </div>

            {/* Explore Section */}
            <div className="info-card">
              <h2>Explore {city.name}</h2>
              <div className="explore-list">
                {city.explore && city.explore.length > 0 ? (
                  city.explore.map((item, index) => (
                    <div key={index} className="explore-item">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  ))
                ) : (
                  <p>No exploration information available.</p>
                )}
              </div>
            </div>

            {/* Local Specialties */}
            <div className="info-card">
              <h2>Local Specialties</h2>
              <div>
                {city.localSpecialties && city.localSpecialties.length > 0 ? (
                  <ul className="specialties-list">
                    {city.localSpecialties.map((specialty, index) => (
                      <li key={index}>{specialty}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No specialties information available.</p>
                )}
              </div>
            </div>

            {/* Share Your Experience - moved to main content area */}
            <div className="info-card share-experience-card">
              <h2>Share Your Experience</h2>
              <p>Share your experience with NorthEast India by uploading your photos</p>
              <form id="photoUploadForm" className="upload-form">
                <input type="hidden" id="citySelect" name="citySelect" value={city.slug} />
                <div className="current-city-display">
                  <label>City:</label>
                  <span className="current-city-name">{city.name}</span>
                </div>
                <input type="file" id="photoInput" name="photo" accept="image/*" aria-label="Select photo" />
                <input type="text" id="caption" name="caption" placeholder="Describe your photo" aria-label="Photo caption" />
                <button type="submit" className="btn btn-primary">Upload Photo</button>
              </form>
              <div id="uploadMessage" className="feedback-message"></div>
            </div>

            {/* Sidebar */}
            <aside className="sidebar">
              {/* Quick Facts */}
              <div className="sidebar-card">
                <h3>Quick Facts</h3>
                <div>
                  {city.quickInfo && city.quickInfo.length > 0 ? (
                    city.quickInfo.map((info, index) => (
                      <div key={index} className="fact-item">
                        <span className="fact-icon">📌</span>
                        <span><strong>{info.title}:</strong> {info.description}</span>
                      </div>
                    ))
                  ) : (
                    // Fallback to hardcoded facts if no dynamic facts are available
                    <>
                      <div className="fact-item">
                        <span className="fact-icon">🏛️</span>
                        <span><strong>State:</strong> {city.stateName}</span>
                      </div>
                      <div className="fact-item">
                        <span className="fact-icon">⏱️</span>
                        <span><strong>Best Time:</strong> {city.bestTime}</span>
                      </div>
                      <div className="fact-item">
                        <span className="fact-icon">🌐</span>
                        <span><strong>Connectivity:</strong> {city.connectivity}</span>
                      </div>
                      <div className="fact-item">
                        <span className="fact-icon">🏨</span>
                        <span><strong>Accommodation:</strong> {city.accommodation}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="city-map-section">
        <div className="container">
          <div className="section-header">
            <h2>Points of Interest</h2>
            <p>Click on markers to explore {city.name}'s attractions</p>
          </div>
          <div className="map-container">
            <div id="cityMap" className="interactive-map" aria-label="Interactive map of the city">
              <InteractiveMap type="city" data={{ city }} />
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-header">
            <h2>Photo Gallery</h2>
            <p>Beautiful moments captured by travelers</p>
          </div>
          <div className="gallery-grid">
            {city.gallery && city.gallery.filter(img => img.moderated).length > 0 ? (
              city.gallery
                .filter(img => img.moderated)
                .map((image, index) => (
                  <div 
                    key={image.id || index} 
                    className="gallery-item"
                    onClick={() => {
                      setCurrentImageIndex(city.gallery.findIndex(img => img.id === image.id));
                      setLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={image.url} 
                      alt={image.caption || `${city.name} photo ${index + 1}`} 
                    />
                    {image.caption && (
                      <div className="gallery-caption">
                        <p>{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <p>No photos available yet. Be the first to share your experience!</p>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox active" onClick={() => setLightboxOpen(false)}>
          <span className="lightbox-close">&times;</span>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            {city.gallery && city.gallery.filter(img => img.moderated).length > 0 && (
              <>
                <img 
                  src={city.gallery.filter(img => img.moderated)[currentImageIndex]?.url} 
                  alt={city.gallery.filter(img => img.moderated)[currentImageIndex]?.caption || 'Gallery image'} 
                />
                {city.gallery.filter(img => img.moderated)[currentImageIndex]?.caption && (
                  <div className="lightbox-caption">
                    <p>{city.gallery.filter(img => img.moderated)[currentImageIndex].caption}</p>
                  </div>
                )}
              </>
            )}
          </div>
          <button 
            className="lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => 
                prev === 0 ? city.gallery.filter(img => img.moderated).length - 1 : prev - 1
              );
            }}
          >
            ❮
          </button>
          <button 
            className="lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => 
                prev === city.gallery.filter(img => img.moderated).length - 1 ? 0 : prev + 1
              );
            }}
          >
            ❯
          </button>
        </div>
      )}
      
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
                <li><a href="/">Home</a></li>
                <li><a href="/#states">All States</a></li>
                <li><a href="/admin">Admin Portal</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Feedback</h3>
              <form id="cityFeedbackForm" className="feedback-form">
                <input type="text" id="cityFeedbackName" name="name" placeholder="Your Name" required aria-label="Your name" />
                <input type="email" id="cityFeedbackEmail" name="email" placeholder="Your Email" required aria-label="Your email" />
                <textarea id="cityFeedbackMessage" name="message" placeholder="Your Message" required aria-label="Your message" rows="4"></textarea>
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
    </div>
  );
}

// Fetch data at build time
export async function getStaticProps({ params }) {
  try {
    const city = await getCity(params.slug);
    
    if (!city) {
      return {
        notFound: true,
      };
    }

    // Get state name for breadcrumb
    // Instead of importing the file directly, we'll make API calls
    const citiesRes = await fetch('http://localhost:3000/api/cities');
    const citiesData = await citiesRes.json();
    const cityData = citiesData.find(c => c.slug === params.slug);
    
    const statesRes = await fetch('http://localhost:3000/api/states');
    const states = await statesRes.json();
    const state = states.find(s => s.slug === cityData.stateSlug);
    
    return {
      props: {
        city: {
          ...cityData,
          stateName: state ? state.name : cityData.stateSlug
        },
      },
      revalidate: 60, // Revalidate at most once per minute
    };
  } catch (error) {
    console.error('Failed to fetch city data:', error);
    return {
      notFound: true,
    };
  }
}

// Generate static paths at build time
export async function getStaticPaths() {
  try {
    // Instead of importing the file directly, we'll make an API call
    const res = await fetch('http://localhost:3000/api/cities');
    const cities = await res.json();
    
    const paths = cities.map((city) => ({
      params: { slug: city.slug },
    }));

    return {
      paths,
      fallback: 'blocking', // Generate pages on-demand if not pre-rendered
    };
  } catch (error) {
    console.error('Failed to fetch cities for paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}