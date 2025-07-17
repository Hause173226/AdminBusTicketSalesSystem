import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minLoadingTime = 500; // Tối thiểu 500ms
  const loadingStartTimeRef = useRef<number | null>(null);

  const showLoading = () => {
    if (!isLoading) {
      loadingStartTimeRef.current = Date.now();
      setIsLoading(true);
    }
  };

  const hideLoading = () => {
    if (isLoading && loadingStartTimeRef.current) {
      const elapsedTime = Date.now() - loadingStartTimeRef.current;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      if (remainingTime > 0) {
        // Clear existing timeout if any
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        // Set timeout to hide loading after minimum time
        loadingTimeoutRef.current = setTimeout(() => {
          setIsLoading(false);
          loadingStartTimeRef.current = null;
          loadingTimeoutRef.current = null;
        }, remainingTime);
      } else {
        setIsLoading(false);
        loadingStartTimeRef.current = null;
      }
    }
  };

  useEffect(() => {
    // Lắng nghe custom event từ axiosInstance
    const handleApiLoading = (event: CustomEvent) => {
      if (event.detail.isLoading) {
        showLoading();
      } else {
        hideLoading();
      }
    };

    window.addEventListener('apiLoading', handleApiLoading as EventListener);

    return () => {
      window.removeEventListener('apiLoading', handleApiLoading as EventListener);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 