import { useLoading } from '../contexts/LoadingContext';

export const useApiLoading = () => {
  const { isLoading, showLoading, hideLoading } = useLoading();
  
  return {
    isLoading,
    showLoading,
    hideLoading
  };
}; 