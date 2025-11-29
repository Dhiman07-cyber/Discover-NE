import { useState, useEffect } from 'react';

const Lightbox = ({ images = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];

  // Expose the openLightbox function to be used by gallery items
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openLightbox = openLightbox;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.openLightbox;
      }
    };
  }, []);

  return (
    <>
      {/* Lightbox Modal */}
      {isOpen && (
        <div className="lightbox active" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
          <div className="lightbox-content">
            {currentImage && (
              <>
                <img 
                  id="lightboxImage" 
                  src={currentImage.url} 
                  alt={currentImage.caption || `Image ${currentIndex + 1}`} 
                  onError={(e) => e.target.src = '/assets/placeholder.jpg'} 
                />
                {currentImage.caption && (
                  <div className="lightbox-caption">
                    <p id="lightboxCaption">{currentImage.caption}</p>
                  </div>
                )}
              </>
            )}
          </div>
          {images.length > 1 && (
            <>
              <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>❮</button>
              <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>❯</button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Lightbox;