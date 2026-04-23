import { createContext, useContext } from 'react';
import { useMobileDetect } from '../hooks/useMobileDetect';

const MobileContext = createContext(false);

export function MobileProvider({ children }) {
  const isMobile = useMobileDetect();
  return <MobileContext.Provider value={isMobile}>{children}</MobileContext.Provider>;
}

export function useIsMobile() {
  return useContext(MobileContext);
}