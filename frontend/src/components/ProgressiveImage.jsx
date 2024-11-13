import { useState, useEffect } from 'react';

const ProgressiveImage = ({ src, placeholder="https://assets-v2.lottiefiles.com/a/04b5804a-1161-11ee-b72d-2fca51545fab/sWU9zH0HSi.gif", children }) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
  }, [src]);

  return children(currentSrc, loading);
};

export default ProgressiveImage;
