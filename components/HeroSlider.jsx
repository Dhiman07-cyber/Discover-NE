import { useState, useEffect, useRef } from 'react';

const HeroSlider = ({ slides = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);
  const progressBarRef = useRef(null);

  // Default slides if none provided - now includes all 8 states
  const defaultSlides = [
    {
      image: 'https://www.ibef.org/assets/images/states/Assam-2.jpg',
      alt: 'Assam - Land of Red Rivers and Blue Hills',
      title: 'Assam',
      subtitle: 'The Gateway to Northeast India',
      description: 'Home to the mighty Brahmaputra, world-famous tea gardens, and the one-horned rhinoceros'
    },
    {
      image: 'https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2024/12/16180042/india-places-Tawang-gate.jpg',
      alt: 'Arunachal Pradesh - Land of the Rising Sun',
      title: 'Arunachal Pradesh',
      subtitle: 'Land of the Dawn-Lit Mountains',
      description: 'India\'s easternmost state with pristine valleys, Buddhist monasteries, and diverse tribes'
    },
    {
      image: 'https://images.travelandleisureasia.com/wp-content/uploads/sites/3/2024/12/02180107/seven-sisters-falls-meghalaya.jpeg',
      alt: 'Meghalaya - Abode of Clouds',
      title: 'Meghalaya',
      subtitle: 'The Abode of Clouds',
      description: 'Experience living root bridges, Asia\'s cleanest village, and the wettest place on Earth'
    },
    {
      image: 'https://i.pinimg.com/originals/14/66/c2/1466c2a3c90e6f8abd81d115cc0a842d.jpg',
      alt: 'Manipur - Jewel of India',
      title: 'Manipur',
      subtitle: 'The Jewel of India',
      description: 'Known for its natural beauty, rich culture, classical dance form Manipuri, and the floating Loktak Lake'
    },
    {
      image: 'https://www.adotrip.com/public/images/city/master_images/5e411f60a0dc5-Aizawl_Attractions.jpg',
      alt: 'Mizoram - Land of the Hill People',
      title: 'Mizoram',
      subtitle: 'The Land of the Hill People',
      description: 'Known for its dramatic hills, pleasant climate, and the unique bamboo flowering phenomenon'
    },
    {
      image: 'https://www.adotrip.com/public/images/state/master_images/5f215a8f6c2a7-Nagaland_Attractions.jpg',
      alt: 'Nagaland - Land of Festivals',
      title: 'Nagaland',
      subtitle: 'The Land of Festivals',
      description: 'Home to diverse tribal cultures, each with unique traditions, colorful attires, and the famous Hornbill Festival'
    },
    {
      image: 'https://www.adotrip.com/public/images/city/master_images/5e3d0c5e61d04-Gangtok_Sightseeing.jpg',
      alt: 'Sikkim - Himalayan Wonderland',
      title: 'Sikkim',
      subtitle: 'Himalayan Wonderland',
      description: 'Known for its biodiversity, Buddhist monasteries, adventure tourism, and stunning views of Kanchenjunga'
    },
    {
      image: 'https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2025/04/03100840/Mizoram-waterfall.jpg',
      alt: 'Tripura - Land of Two Goddesses',
      title: 'Tripura',
      subtitle: 'The Land of Two Goddesses',
      description: 'Known for its palaces, temples, rich cultural heritage, and being home to diverse tribal communities'
    }
  ];

  const slidesToUse = slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set up new interval for slide changes
    intervalRef.current = setInterval(() => {
      goToNext();
    }, 6000);

    // Start progress bar animation
    startProgressBarAnimation();

    // Clean up interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startProgressBarAnimation = () => {
    // Reset progress bar
    if (progressBarRef.current) {
      progressBarRef.current.style.transition = 'none';
      progressBarRef.current.style.width = '0%';
      
      // Force reflow
      progressBarRef.current.offsetHeight;
      
      // Start animation
      progressBarRef.current.style.transition = 'width 6s linear';
      progressBarRef.current.style.width = '100%';
    }
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slidesToUse.length);
    setTimeout(() => setIsAnimating(false), 1500);
    
    // Restart progress bar animation
    setTimeout(() => {
      startProgressBarAnimation();
    }, 50);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? slidesToUse.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 1500);
    
    // Restart progress bar animation
    setTimeout(() => {
      startProgressBarAnimation();
    }, 50);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 1500);
    
    // Restart progress bar animation
    setTimeout(() => {
      startProgressBarAnimation();
    }, 50);
  };

  return (
    <div className="hero-slider-container">
      <div className="hero-slides-wrapper">
        {slidesToUse.map((slide, index) => (
          <div 
            key={index} 
            className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
          >
            <div className="hero-slide-bg">
              <img src={slide.image} alt={slide.alt} onError={(e) => e.target.src = '/assets/placeholder.jpg'} />
              <div className="hero-overlay"></div>
            </div>
            
            <div className="hero-slide-content">
              <div className="hero-content-inner">
                {slide.subtitle && <span className="hero-subtitle">{slide.subtitle}</span>}
                <h1 className="hero-title" data-state={slide.title ? slide.title.toLowerCase().replace(/\s+/g, '-') : ''}>{slide.title}</h1>
                {slide.description && <p className="hero-description">{slide.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="hero-nav hero-prev" onClick={goToPrev} aria-label="Previous slide">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <button className="hero-nav hero-next" onClick={goToNext} aria-label="Next slide">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
      
      <div className="hero-progress">
        <div 
          ref={progressBarRef}
          className="hero-progress-bar" 
        ></div>
      </div>
      
      <div className="hero-indicators">
        {slidesToUse.map((_, index) => (
          <button
            key={index}
            className={`hero-indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;