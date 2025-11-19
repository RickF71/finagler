/**
 * CSS Variable Parser and Utilities for Phase 10I.2
 * Extracts CSS custom properties and normalizes color values
 */

/**
 * Extract all CSS custom properties (--var-name: value) from CSS content
 * @param {string} cssContent - The CSS content to parse
 * @returns {object} - { variables: { "--var-name": "value" }, count: number }
 */
export function parseCSSVariables(cssContent) {
  if (!cssContent || typeof cssContent !== 'string') {
    return { variables: {}, count: 0 };
  }

  const variables = {};
  
  // Regex to match CSS custom properties: --variable-name: value;
  // Handles multi-line declarations and various value types
  const cssVarRegex = /--([\w-]+)\s*:\s*([^;]+);?/g;
  
  let match;
  while ((match = cssVarRegex.exec(cssContent)) !== null) {
    const varName = `--${match[1].trim()}`;
    const varValue = match[2].trim();
    
    // Store the variable (later declarations override earlier ones)
    variables[varName] = normalizeValue(varValue);
  }

  return {
    variables,
    count: Object.keys(variables).length
  };
}

/**
 * Normalize color and other CSS values
 * @param {string} value - Raw CSS value
 * @returns {string} - Normalized value
 */
export function normalizeValue(value) {
  if (!value) return value;
  
  const trimmed = value.trim();
  
  // Handle comments and multiple values
  const cleanValue = trimmed.split('/*')[0].trim();
  
  // Try to normalize color values
  const colorValue = normalizeColor(cleanValue);
  if (colorValue !== cleanValue) {
    return colorValue;
  }
  
  return cleanValue;
}

/**
 * Normalize color values (hex, rgb, hsl) to standardized format
 * @param {string} colorValue - CSS color value
 * @returns {string} - Normalized color or original value if not a color
 */
export function normalizeColor(colorValue) {
  if (!colorValue) return colorValue;
  
  const value = colorValue.toLowerCase().trim();
  
  // Handle hex colors
  const hexMatch = value.match(/^#([a-f0-9]{3}|[a-f0-9]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    // Expand 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return `#${hex.toUpperCase()}`;
  }
  
  // Handle rgb/rgba
  const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    const [, r, g, b, a] = rgbMatch;
    if (a !== undefined && parseFloat(a) !== 1) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
      // Convert to hex for consistency
      const hexR = parseInt(r).toString(16).padStart(2, '0');
      const hexG = parseInt(g).toString(16).padStart(2, '0');
      const hexB = parseInt(b).toString(16).padStart(2, '0');
      return `#${hexR}${hexG}${hexB}`.toUpperCase();
    }
  }
  
  // Handle hsl/hsla
  const hslMatch = value.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
  if (hslMatch) {
    const [, h, s, l, a] = hslMatch;
    if (a !== undefined && parseFloat(a) !== 1) {
      return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    } else {
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  }
  
  // Handle named colors (basic set)
  const namedColors = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'green': '#008000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'silver': '#C0C0C0',
    'gray': '#808080',
    'maroon': '#800000',
    'olive': '#808000',
    'lime': '#00FF00',
    'aqua': '#00FFFF',
    'teal': '#008080',
    'navy': '#000080',
    'fuchsia': '#FF00FF',
    'purple': '#800080'
  };
  
  if (namedColors[value]) {
    return namedColors[value];
  }
  
  // Return original value if not a recognized color
  return colorValue;
}

/**
 * Check if a value is a color (hex, rgb, hsl, or named color)
 * @param {string} value - Value to check
 * @returns {boolean} - True if value appears to be a color
 */
export function isColor(value) {
  if (!value) return false;
  
  const normalized = normalizeColor(value);
  return normalized !== value || // Was normalized (changed)
         /^#[a-f0-9]{6}$/i.test(value) || // Hex
         /^rgba?\(/i.test(value) || // RGB/RGBA
         /^hsla?\(/i.test(value) || // HSL/HSLA
         ['black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 
          'silver', 'gray', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy', 
          'fuchsia', 'purple', 'transparent'].includes(value.toLowerCase());
}

/**
 * Generate color variations for a given color value
 * @param {string} colorValue - Color value to generate variations for
 * @returns {object} - Object with hex, rgb, hsl variants when possible
 */
export function getColorVariations(colorValue) {
  if (!isColor(colorValue)) {
    return { original: colorValue };
  }
  
  const normalized = normalizeColor(colorValue);
  const variations = { original: colorValue, normalized };
  
  // If we have a hex color, generate RGB and HSL
  const hexMatch = normalized.match(/^#([a-f0-9]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    variations.hex = normalized;
    variations.rgb = `rgb(${r}, ${g}, ${b})`;
    
    // Convert to HSL
    const hsl = rgbToHsl(r, g, b);
    variations.hsl = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
  }
  
  return variations;
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255) 
 * @param {number} b - Blue (0-255)
 * @returns {object} - {h, s, l} where h is 0-360, s and l are 0-100
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }
  
  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
}

/**
 * Mock API endpoint for CSS variables (frontend-only implementation)
 * Simulates the backend /api/domain/{id}/css/vars endpoint
 * @param {string} cssContent - CSS content to extract variables from
 * @returns {object} - API response format with variables, count, and hash
 */
export function extractCSSVariablesAPI(cssContent) {
  const result = parseCSSVariables(cssContent);
  
  // Generate a simple hash for the variable set
  const variableString = JSON.stringify(result.variables, Object.keys(result.variables).sort());
  const hash = btoa(variableString).substring(0, 16);
  
  return {
    variables: result.variables,
    count: result.count,
    hash,
    extracted_at: new Date().toISOString()
  };
}