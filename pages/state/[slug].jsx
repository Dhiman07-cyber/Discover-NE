import Head from 'next/head';
import { getState, getAllStates } from '../../utils/data.jsx';
import HeroSlider from '../../components/HeroSlider.jsx';
import InteractiveMap from '../../components/InteractiveMap.jsx';
import { useState, useEffect } from 'react';

export default function StatePage({ stateData }) {
  if (!stateData) return <div>State not found</div>;

  // Generate other states links (excluding current state)
  const allStates = [
    { name: 'Assam', slug: 'assam' },
    { name: 'Arunachal Pradesh', slug: 'arunachal-pradesh' },
    { name: 'Meghalaya', slug: 'meghalaya' },
    { name: 'Manipur', slug: 'manipur' },
    { name: 'Mizoram', slug: 'mizoram' },
    { name: 'Nagaland', slug: 'nagaland' },
    { name: 'Sikkim', slug: 'sikkim' },
    { name: 'Tripura', slug: 'tripura' }
  ];
  
  const otherStates = allStates.filter(s => s.slug !== stateData.slug);

  useEffect(() => {
    // Initialize photo upload form
    const initializePhotoUploadForm = () => {
      if (typeof window === 'undefined') return;
      
      const photoUploadForm = document.getElementById('photoUploadForm');
      const uploadMessage = document.getElementById('uploadMessage');
      
      if (!photoUploadForm) return;
      
      // Handle form submission
      photoUploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const photoInput = document.getElementById('photoInput');
        const photo = photoInput.files[0];
        const caption = formData.get('caption') || '';
        
        if (!photo) {
          showMessage('Please select a photo to upload', 'error');
          return;
        }
        
        // Validate file size (5MB max)
        if (photo.size > 5 * 1024 * 1024) {
          showMessage('Image size must be less than 5MB', 'error');
          return;
        }
        
        // Validate file type - only allow jpg and png
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(photo.type)) {
          showMessage('Only jpg and png file formats are allowed', 'error');
          return;
        }
        
        try {
          showMessage('Uploading...', 'info');
          
          const uploadFormData = new FormData();
          uploadFormData.append('photo', photo);
          uploadFormData.append('citySlug', stateData.slug);
          uploadFormData.append('caption', caption);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData
          });
          
          const result = await response.json();
          
          if (response.ok && result.success) {
            showMessage('Photo uploaded successfully! It will be visible after admin approval.', 'success');
            photoUploadForm.reset();
          } else {
            showMessage(result.error || 'Upload failed', 'error');
          }
        } catch (error) {
          console.error('Upload error:', error);
          showMessage('Upload failed. Please try again.', 'error');
        }
      });
      
      // Show message function
      function showMessage(text, type) {
        let classes = 'feedback-message show ';
        if (type === 'error') {
          classes += 'error';
        } else if (type === 'success') {
          classes += 'success';
        } else {
          classes += 'info';
        }
        uploadMessage.className = classes;
        uploadMessage.textContent = text;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
          setTimeout(() => {
            uploadMessage.classList.remove('show');
          }, 5000);
        }
      }
    };

    // Initialize the form when component mounts
    initializePhotoUploadForm();
  }, [stateData]);

  return (
    <div>
      <Head>
        <title>{`${stateData.name} - Discover NorthEast India`}</title>
        <meta name="description" content={`Explore ${stateData.name}'s unique attractions, cities, culture and heritage`} />
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
              <li><a href="/#states" className="active">States</a></li>
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
            <li><span id="stateBreadcrumb">{stateData.name}</span></li>
          </ol>
        </div>
      </nav>

      {/* Enhanced Hero Section with Modern Slideshow */}
      <section className="hero-section" aria-label="Featured state images">
        <div id="heroSlideshow" className="hero-slideshow">
          <HeroSlider slides={stateData.featuredImages?.map((img, index) => ({
            image: img,
            alt: `${stateData.name} - Image ${index + 1}`,
            title: stateData.name,
            subtitle: index === 0 ? `Welcome to ${stateData.name}` : `Discover ${stateData.name}`,
            description: stateData.tagline || `Explore the beauty and culture of ${stateData.name}`
          })) || []} />
        </div>
        <div className="hero-content">
          <h1 id="stateName" className="state-title">{stateData.name}</h1>
          <p id="stateTagline" className="state-tagline">Capital: {stateData.capital}</p>
        </div>
      </section>

      {/* State Information */}
      <section className="state-info-section">
        <div className="container">
          <div className="info-grid">
            {/* Description Section */}
            <div className="info-card">
              <h2>About {stateData.name}</h2>
              <div id="stateDescription">
                <p>{stateData.description}</p>
              </div>
            </div>

            {/* Historical Details */}
            <div className="info-card">
              <h2>History & Heritage</h2>
              <div id="stateHistory">
                <p>{stateData.history}</p>
              </div>
            </div>

            {/* Festivals & Events */}
            <div className="info-card">
              <h2>Festivals & Events</h2>
              <div id="stateFestivals">
                {stateData.festivals && stateData.festivals.length > 0 ? (
                  <ul className="festivals-list">
                    {stateData.festivals.map((festival, index) => (
                      <li key={index} className="festival-item">
                        <h4>{festival.name}</h4>
                        <p>{festival.summary}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No festival information available.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="sidebar">
              {/* Regional Highlights */}
              <div className="sidebar-card">
                <h3>Regional Highlights</h3>
                <div id="stateHighlights">
                  {stateData.highlights && stateData.highlights.length > 0 ? (
                    <ul className="highlights-list">
                      {stateData.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No highlights available.</p>
                  )}
                </div>
              </div>

              {/* Quick Facts */}
              <div className="sidebar-card">
                <h3>Quick Facts</h3>
                <div id="stateQuickFacts">
                  {stateData.quickFacts && stateData.quickFacts.length > 0 ? (
                    stateData.quickFacts.map((fact, index) => (
                      <div key={index} className="fact-item">
                        <span className="fact-icon">📌</span>
                        <span><strong>{fact.title}:</strong> {fact.description}</span>
                      </div>
                    ))
                  ) : (
                    // Fallback to hardcoded facts if no dynamic facts are available
                    <>
                      <div className="fact-item">
                        <span className="fact-icon">📍</span>
                        <span id="stateCapital"><strong>Capital:</strong> {stateData.capital}</span>
                      </div>
                      <div className="fact-item">
                        <span className="fact-icon">🗣️</span>
                        <span id="stateLanguages"><strong>Languages:</strong> {stateData.languages}</span>
                      </div>
                      <div className="fact-item">
                        <span className="fact-icon">🌡️</span>
                        <span id="stateBestTime"><strong>Best Time:</strong> {stateData.bestTime}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Interactive State Map */}
      <section className="state-map-section">
        <div className="container">
          <div className="section-header">
            <h2>Explore Cities</h2>
            <p>Click on a city marker to explore its attractions</p>
          </div>
          <div className="map-container">
            <div id="stateMap" className="interactive-map" aria-label="Interactive map of the state">
              <InteractiveMap type="state" data={{ state: stateData, cities: stateData.citiesData }} />
            </div>
            {/* Cities List Fallback */}
            <div className="cities-list-fallback" id="citiesListFallback">
              <h3>Cities to Explore:</h3>
              <ul className="cities-list" id="citiesList">
                {/* Will be populated dynamically */}
                {stateData.citiesData && stateData.citiesData.map(city => (
                  <li key={city.slug}>
                    <a href={`/city/${city.slug}`} className="city-list-link">
                      <span className="city-icon">🏙️</span>
                      <div>
                        <strong className="city-name">{city.name}</strong>
                        <p>{city.summary?.substring(0, 80) + '...'}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Places Grid */}
      <section className="cities-section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Places</h2>
            <p>Discover the most visited places in this state</p>
          </div>
          <div className="cities-grid" id="citiesGrid">
            {/* Will be populated dynamically */}
            {stateData.citiesData && stateData.citiesData.map(city => (
              <div key={city.slug} className="city-card" onClick={() => window.location.href = `/city/${city.slug}`}>
                <div className="card-badge city-badge">City</div>
                <img src={city.featuredImages?.[0] || '/assets/placeholder.jpg'} 
                     alt={city.name} 
                     onError={(e) => e.target.src = '/assets/placeholder.jpg'} />
                <div className="city-card-content">
                  <h3>{city.name}</h3>
                  <p>{city.summary?.substring(0, 100) + '...'}</p>
                  <span className="card-link">Explore City →</span>
                </div>
              </div>
            ))}
          </div>
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
                <li><a href="/">Home</a></li>
                <li><a href="/#states">All States</a></li>
                <li><a href="/admin">Admin Portal</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Explore More</h3>
              <p>Discover other states in NorthEast India</p>
              <div className="other-states-links" id="otherStates">
                {/* Will be populated dynamically */}
                {otherStates.map(state => (
                  <a href={`/state/${state.slug}`} key={state.slug}>{state.name}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Discover NorthEast. Made with ❤️ for Hackathon</p>
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
    const stateData = await getState(params.slug);
    
    if (!stateData) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        stateData,
      },
      revalidate: 60, // Revalidate at most once per minute
    };
  } catch (error) {
    console.error('Failed to fetch state data:', error);
    return {
      notFound: true,
    };
  }
}

// Generate static paths at build time
export async function getStaticPaths() {
  try {
    const states = await getAllStates();
    
    const paths = states.map((state) => ({
      params: { slug: state.slug },
    }));

    return {
      paths,
      fallback: 'blocking', // Generate pages on-demand if not pre-rendered
    };
  } catch (error) {
    console.error('Failed to fetch states for paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}