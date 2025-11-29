import React, { useState, useEffect, useRef, useCallback } from 'react';

const InfiniteCarousel = () => {
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(0);
  const animationRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cardWidth = 380; // 350px width + 30px margin
  
  // Reset animation to start from correct position
  const resetAnimation = useCallback((position) => {
    if (!trackRef.current) return;
    
    const totalWidth = trackRef.current.scrollWidth / 2;
    const normalizedPosition = Math.abs(position) % totalWidth;
    
    // Calculate animation timing - maintain the same speed regardless of position
    const animationDuration = 40; // Match CSS animation duration
    
    // Apply new animation
    trackRef.current.style.animation = 'none';
    trackRef.current.style.transform = `translateX(${-normalizedPosition}px)`;
    trackRef.current.offsetHeight; // Trigger reflow
    trackRef.current.style.animation = `scroll-left ${animationDuration}s linear infinite`;
    
    // Ensure animation is running
    trackRef.current.style.animationPlayState = 'running';
  }, []);

  // Carousel navigation functions
  const pauseCarousel = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = 'paused';
      setIsPlaying(false);
    }
  };

  const playCarousel = () => {
    if (trackRef.current) {
      // Ensure the animation is properly restarted
      trackRef.current.style.animationPlayState = 'running';
      // Force reflow to ensure animation restarts
      trackRef.current.offsetHeight;
      setIsPlaying(true);
    }
  };

  const nextSlide = () => {
    // Prevent multiple clicks during transition
    if (isTransitioning || !trackRef.current) return;
    
    setIsTransitioning(true);
    pauseCarousel();
    trackRef.current.classList.add('manual-control');
    
    // Get current transform value
    const computedStyle = window.getComputedStyle(trackRef.current);
    const transform = computedStyle.transform;
    
    // Extract current translateX value
    let currentX = 0;
    if (transform && transform !== 'none') {
      const matrix = new DOMMatrixReadOnly(transform);
      currentX = matrix.m41;
    }
    
    // Calculate new position (move one card to the right)
    const newX = currentX - cardWidth;
    
    // Apply immediate transform without animation
    trackRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    trackRef.current.style.transform = `translateX(${newX}px)`;
    
    // Resume animation after transition completes
    setTimeout(() => {
      if (trackRef.current) {
        // Remove transition
        trackRef.current.style.transition = '';
        // Remove manual control class
        trackRef.current.classList.remove('manual-control');
        
        // Reset animation to start from new position
        resetAnimation(Math.abs(newX));
        
        // Resume auto animation
        playCarousel();
        setIsTransitioning(false);
      }
    }, 600);
  };

  const prevSlide = () => {
    // Prevent multiple clicks during transition
    if (isTransitioning || !trackRef.current) return;
    
    setIsTransitioning(true);
    pauseCarousel();
    trackRef.current.classList.add('manual-control');
    
    // Get current transform value
    const computedStyle = window.getComputedStyle(trackRef.current);
    const transform = computedStyle.transform;
    
    // Extract current translateX value
    let currentX = 0;
    if (transform && transform !== 'none') {
      const matrix = new DOMMatrixReadOnly(transform);
      currentX = matrix.m41;
    }
    
    // Calculate new position (move one card to the left)
    const newX = currentX + cardWidth;
    
    // Apply immediate transform without animation
    trackRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    trackRef.current.style.transform = `translateX(${newX}px)`;
    
    // Resume animation after transition completes
    setTimeout(() => {
      if (trackRef.current) {
        // Remove transition
        trackRef.current.style.transition = '';
        // Remove manual control class
        trackRef.current.classList.remove('manual-control');
        
        // Reset animation to start from new position
        resetAnimation(Math.abs(newX));
        
        // Resume auto animation
        playCarousel();
        setIsTransitioning(false);
      }
    }, 600);
  };

  // Feature boxes data
  const featureBoxes = [
    {
      key: "cultural",
      icon: "🎭",
      title: "Cultural Tapestry",
      description: "Experience the vibrant mosaic of traditions with over 200 ethnic groups. From Bihu festivals in Assam to Hornbill celebrations in Nagaland, discover living cultures that have thrived for centuries.",
      stats: [
        { value: "200+", label: "Ethnic Groups" },
        { value: "160+", label: "Languages" }
      ],
      highlight: "Bihu, Hornbill & More"
    },
    {
      key: "natural",
      icon: "🌺",
      title: "Biodiversity Paradise",
      description: "Home to UNESCO World Heritage Sites and wildlife sanctuaries with rare species. Discover the unique ecosystems from Kaziranga's rhinos to Eaglenest's bird diversity in pristine natural habitats.",
      stats: [
        { value: "50+", label: "National Parks" },
        { value: "15+", label: "UNESCO Sites" }
      ],
      highlight: "Living Root Bridges"
    },
    {
      key: "adventure",
      icon: "🧗",
      title: "Adventure Capital",
      description: "Experience adrenaline-pumping activities in breathtaking landscapes. From river rafting in Arunachal Pradesh to trekking in Sikkim's mountains, find your next adventure in the untouched wilderness.",
      stats: [
        { value: "100+", label: "Trekking Routes" },
        { value: "50+", label: "Adventure Sports" }
      ],
      highlight: "Explore Adventures"
    },
    {
      key: "culinary",
      icon: "🍜",
      title: "Culinary Delights",
      description: "Savor unique flavors from bamboo shoot delicacies to fermented fish curries. Experience the distinct taste profiles that reflect the region's diverse cultural influences and indigenous ingredients.",
      stats: [
        { value: "500+", label: "Local Dishes" },
        { value: "8", label: "Cuisine Styles" }
      ],
      highlight: "Momos & Thukpa"
    },
    {
      key: "spiritual",
      icon: "🕉️",
      title: "Spiritual Journeys",
      description: "Embark on sacred pilgrimages to ancient monasteries and temples. From Tawang's Buddhist monasteries to Kamakhya Temple, find peace and enlightenment in the region's spiritual heartlands.",
      stats: [
        { value: "100+", label: "Sacred Sites" },
        { value: "5", label: "Major Religions" }
      ],
      highlight: "Tawang & Kamakhya"
    },
    {
      key: "handicrafts",
      icon: "🧵",
      title: "Artisan Treasures",
      description: "Discover exquisite handwoven textiles, bamboo crafts, and traditional art forms. Each piece tells a story of generations of skilled artisans preserving ancient techniques and cultural motifs.",
      stats: [
        { value: "200+", label: "Craft Types" },
        { value: "50+", label: "Artisan Communities" }
      ],
      highlight: "Mekhela Chador"
    },
    {
      key: "tea",
      icon: "☕",
      title: "Tea Paradise",
      description: "Explore the world's largest tea gardens and sample the finest brews. From Assam's robust black tea to Darjeeling's delicate muscatel, experience the region's tea culture firsthand.",
      stats: [
        { value: "8", label: "Tea Varieties" },
        { value: "150+", label: "Tea Estates" }
      ],
      highlight: "Assam & Darjeeling"
    }
  ];

  // Render feature boxes
  const renderFeatureBoxes = () => {
    // Create duplicated array for infinite scroll effect
    const duplicatedBoxes = [...featureBoxes, ...featureBoxes];
    
    return duplicatedBoxes.map((box, index) => (
      <div className="feature-box" key={`${box.key}-${index}`}>
        <div className="feature-icon-wrapper">{box.icon}</div>
        <h3>{box.title}</h3>
        <p>{box.description}</p>
        <div className="feature-stats">
          {box.stats.map((stat, statIndex) => (
            <div className="stat-box" key={statIndex}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="feature-highlight">{box.highlight}</div>
      </div>
    ));
  };

  return (
    <div className="features-carousel-container">
      {/* Carousel Navigation Arrows */}
      <button 
        className="carousel-arrow carousel-prev" 
        onClick={prevSlide}
        onMouseEnter={pauseCarousel}
        onMouseLeave={playCarousel}
        aria-label="Previous slide"
      >
        &#8249;
      </button>
      <button 
        className="carousel-arrow carousel-next" 
        onClick={nextSlide}
        onMouseEnter={pauseCarousel}
        onMouseLeave={playCarousel}
        aria-label="Next slide"
      >
        &#8250;
      </button>
      
      <div className="features-carousel" ref={carouselRef}>
        <div 
          className="features-carousel-track" 
          ref={trackRef}
          onMouseEnter={pauseCarousel}
          onMouseLeave={playCarousel}
        >
          {renderFeatureBoxes()}
        </div>
      </div>
    </div>
  );
};

export default InfiniteCarousel;