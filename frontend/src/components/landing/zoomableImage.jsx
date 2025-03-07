import { useState, useRef } from 'react';
const ZoomableImage = ({ src, alt, className}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = (e.pageX - left) / width * 100;
    const y = (e.pageY - top) / height * 100;
    setMousePosition({ x, y });
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-lg cursor-zoom-in mx-auto ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      ref={imageRef}
    >
      <img
        src={src}
        alt={alt}
        className={`transition-transform duration-200 ease-in-out object-cover ${isZoomed ? 'scale-150' : 'scale-100'}`}
        style={isZoomed ? {
          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
        } : {}}
      />
    </div>
  );
};

export default ZoomableImage;
