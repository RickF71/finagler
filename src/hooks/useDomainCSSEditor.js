// src/hooks/useDomainCSSEditor.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDomain } from '../context/DomainContext';
import { createDISInterface } from '../dis/interface';

export const useDomainCSSEditor = () => {
  const { activeDomainId, actAs, API_BASE } = useDomain();
  const [css, setCss] = useState('');
  const [originalCss, setOriginalCss] = useState('');
  const [cssData, setCssData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, modified, verified, invalid
  const [verificationHash, setVerificationHash] = useState(null);
  const [mode, setMode] = useState('text'); // text, json

  const dis = useMemo(() => createDISInterface(API_BASE), [API_BASE]);

  // Load CSS for active domain
  const loadCSS = useCallback(async () => {
    if (!activeDomainId || activeDomainId === 'none') {
      setCss('');
      setOriginalCss('');
      setCssData(null);
      setStatus('idle');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📝 Loading CSS for domain:', activeDomainId);
      
      // Try JSON format first (returns {css_content, domain_id, size, content_type})
      try {
        const jsonResponse = await fetch(`${API_BASE}/api/domain/${activeDomainId}/css`);
        if (jsonResponse.ok && jsonResponse.headers.get('content-type')?.includes('application/json')) {
          const data = await jsonResponse.json();
          setCssData(data);
          // Phase 10J.4: backend returns css_content field
          const cssText = data.css_content || data.css || data.content || '';
          setCss(cssText);
          setOriginalCss(cssText);
          setVerificationHash(data.hash || null);
          console.log('📝 CSS loaded (JSON format):', { hash: data.hash, length: cssText.length });
        } else {
          throw new Error('Not JSON format');
        }
      } catch {
        // Fallback to text format
        const textResponse = await fetch(`${API_BASE}/api/domain/${activeDomainId}/css/text`);
        if (!textResponse.ok) {
          throw new Error(`Failed to load CSS: ${textResponse.statusText}`);
        }
        const cssText = await textResponse.text();
        setCss(cssText);
        setOriginalCss(cssText);
        setCssData({ css_content: cssText });
        console.log('📝 CSS loaded (text format), length:', cssText.length);
      }

      setStatus('idle');
    } catch (err) {
      console.error('❌ Failed to load CSS:', err);
      setError(`Failed to load CSS: ${err.message}`);
      setStatus('invalid');
    } finally {
      setLoading(false);
    }
  }, [activeDomainId, API_BASE, dis]);

  // Save CSS
  const saveCSS = useCallback(async () => {
    if (!activeDomainId || activeDomainId === 'none') return false;
    
    // ActAs authority check - must have acting identity to perform write
    if (!actAs.domain_id) {
      setError('No acting identity selected. Choose a domain to act as in SuperBar.');
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      console.log(`💾 Saving CSS for domain: ${activeDomainId} (acting as: ${actAs.label})`);
      console.log('CSS length:', css.length);
      
      // Phase 10J.4: Save as plain text to /css/text endpoint
      // Use activeDomainId as target, but authority comes from actAs
      const response = await fetch(`${API_BASE}/api/domain/${activeDomainId}/css/text`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain',
          'X-Acting-As': actAs.domain_id,
          'X-Acting-Seat': actAs.seat
        },
        body: css
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      setOriginalCss(css);
      setStatus('verified');
      console.log('✅ CSS saved successfully');
      return true;
    } catch (err) {
      console.error('❌ Failed to save CSS:', err);
      setError(`Failed to save CSS: ${err.message}`);
      setStatus('invalid');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeDomainId, actAs, css, API_BASE]);

  // Verify CSS
  const verifyCSS = useCallback(async () => {
    if (!activeDomainId || activeDomainId === 'none') return null;
    
    // ActAs authority check
    if (!actAs.domain_id) {
      setError('No acting identity selected. Choose a domain to act as in SuperBar.');
      return null;
    }

    setVerifying(true);
    setError(null);

    try {
      console.log(`🔍 Verifying CSS for domain: ${activeDomainId} (acting as: ${actAs.label})`);
      
      const response = await fetch(`${API_BASE}/api/domain/${activeDomainId}/css/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'X-Acting-As': actAs.domain_id,
          'X-Acting-Seat': actAs.seat
        },
        body: css
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setVerificationHash(result.hash);
      setStatus('verified');
      console.log('✅ CSS verified, hash:', result.hash);
      return result;
    } catch (err) {
      console.error('❌ Failed to verify CSS:', err);
      setError(`Verification failed: ${err.message}`);
      setStatus('invalid');
      return null;
    } finally {
      setVerifying(false);
    }
  }, [activeDomainId, actAs, css, API_BASE]);

  // Update CSS and track changes
  const updateCSS = useCallback((newCss) => {
    setCss(newCss);
    if (newCss !== originalCss) {
      setStatus('modified');
    } else {
      setStatus(verificationHash ? 'verified' : 'idle');
    }
  }, [originalCss, verificationHash]);

  // Load CSS when domain changes
  useEffect(() => {
    loadCSS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDomainId]);

  return {
    css,
    originalCss,
    cssData,
    loading,
    saving,
    verifying,
    error,
    status,
    verificationHash,
    mode,
    setMode,
    updateCSS,
    saveCSS,
    verifyCSS,
    reloadCSS: loadCSS
  };
};

export default useDomainCSSEditor;