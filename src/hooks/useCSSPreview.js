// src/hooks/useCSSPreview.js
import { useState, useEffect, useCallback, useRef } from 'react';

export const useCSSPreview = (css, debounceMs = 300) => {
  const [previewCss, setPreviewCss] = useState(css);
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef(null);
  const previewElementRef = useRef(null);

  // Debounced CSS update
  const updatePreview = useCallback((newCss) => {
    setIsUpdating(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setPreviewCss(newCss);
      setIsUpdating(false);
      console.log('🎨 CSS preview updated');
    }, debounceMs);
  }, [debounceMs]);

  // Apply CSS to preview element
  const applyToElement = useCallback((element) => {
    if (!element) return;

    // Remove existing preview style
    const existingStyle = document.getElementById('css-preview-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = 'css-preview-style';
    style.textContent = previewCss;
    document.head.appendChild(style);

    previewElementRef.current = element;
    console.log('🎨 CSS applied to preview element');
  }, [previewCss]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const existingStyle = document.getElementById('css-preview-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Update preview when CSS changes
  useEffect(() => {
    updatePreview(css);
  }, [css, updatePreview]);

  return {
    previewCss,
    isUpdating,
    applyToElement,
    previewElementRef
  };
};

export default useCSSPreview;