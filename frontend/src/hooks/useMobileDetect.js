import { useEffect, useState } from 'react';

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function checkMobile() {
  return MOBILE_UA.test(navigator.userAgent) || window.innerWidth < 768;
}

export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(checkMobile);

  useEffect(() => {
    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}