import { useState, useEffect } from "react";

const ProgressiveImage = ({ 
  src, 
  placeholder = "https://assets-v2.lottiefiles.com/a/04b5804a-1161-11ee-b72d-2fca51545fab/sWU9zH0HSi.gif", 
  children 
}) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.src = src;

    img.onload = () => {
      if (isMounted) {
        setCurrentSrc(src);
        setLoading(false);
      }
    };

    return () => {
      isMounted = false; 
    };
  }, [src]);

  return children(currentSrc, loading);
};

export default ProgressiveImage;
