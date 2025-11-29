import NextImage from 'next/image';

const Image = ({ src, alt, width, height, layout, objectFit, ...props }) => {
  // Check if it's an external URL
  const isExternal = src && (src.startsWith('http') || src.startsWith('//'));
  
  // For external images or when width/height are not provided, use regular img tag
  if (isExternal || !width || !height) {
    return (
      <img
        src={src || '/placeholder.jpg'}
        alt={alt}
        onError={(e) => {
          e.target.src = '/placeholder.jpg';
        }}
        {...props}
      />
    );
  }

  // For local images with dimensions, use Next.js Image component
  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      layout={layout}
      objectFit={objectFit}
      onError={(e) => {
        e.target.src = '/placeholder.jpg';
      }}
      {...props}
    />
  );
};

export default Image;