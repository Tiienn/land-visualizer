import { useEffect } from 'react';

/**
 * Custom hook for managing SEO meta tags
 * Replaces React Helmet for better React 19 compatibility
 */
export function useSEO(meta) {
  useEffect(() => {
    // Update document title
    if (meta.title) {
      document.title = meta.title;
    }
    
    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta && meta.description) {
      descriptionMeta.setAttribute('content', meta.description);
    }
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = meta.canonical || window.location.href;
    
    // Update Open Graph tags
    const updateOGTag = (property, content) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', content);
    };
    
    if (meta.title) updateOGTag('og:title', meta.title);
    if (meta.description) updateOGTag('og:description', meta.description);
    if (meta.image) updateOGTag('og:image', meta.image);
    updateOGTag('og:url', meta.canonical || window.location.href);
    updateOGTag('og:type', 'website');
    
    // Update Twitter Card tags
    const updateTwitterTag = (name, content) => {
      let twitterTag = document.querySelector(`meta[name="${name}"]`);
      if (!twitterTag) {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', name);
        document.head.appendChild(twitterTag);
      }
      twitterTag.setAttribute('content', content);
    };
    
    updateTwitterTag('twitter:card', 'summary_large_image');
    if (meta.title) updateTwitterTag('twitter:title', meta.title);
    if (meta.description) updateTwitterTag('twitter:description', meta.description);
    if (meta.image) updateTwitterTag('twitter:image', meta.image);
  }, [meta]);
}

export default useSEO;