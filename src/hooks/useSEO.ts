import { useEffect } from 'react';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video';
  author?: string;
  publishDate?: string;
  updateDate?: string;
}

/**
 * Hook to manage page meta tags for SEO
 * Updates document title, meta tags, and Open Graph tags
 */
export function useSEO(config: SEOConfig) {
  useEffect(() => {
    // Update title
    document.title = `${config.title} | REET TV`;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', config.description);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', config.keywords?.join(', ') || 'iptv, streaming, live tv');
    }

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', config.title);
    updateMetaTag('property', 'og:description', config.description);
    updateMetaTag('property', 'og:type', config.type || 'website');
    updateMetaTag('property', 'og:url', config.url || window.location.href);
    if (config.image) {
      updateMetaTag('property', 'og:image', config.image);
    }

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:title', config.title);
    updateMetaTag('name', 'twitter:description', config.description);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    if (config.image) {
      updateMetaTag('name', 'twitter:image', config.image);
    }

    // Update article-specific tags
    if (config.type === 'article') {
      if (config.author) {
        updateMetaTag('property', 'article:author', config.author);
      }
      if (config.publishDate) {
        updateMetaTag('property', 'article:published_time', config.publishDate);
      }
      if (config.updateDate) {
        updateMetaTag('property', 'article:modified_time', config.updateDate);
      }
    }

    // Add canonical tag
    updateCanonicalTag(config.url || window.location.href);
  }, [config]);
}

function updateMetaTag(attr: 'name' | 'property', attrValue: string, content: string) {
  let tag = document.querySelector(`meta[${attr}="${attrValue}"]`);
  
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, attrValue);
    document.head.appendChild(tag);
  }
  
  tag.setAttribute('content', content);
}

function updateCanonicalTag(url: string) {
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalTag);
  }
  
  canonicalTag.setAttribute('href', url);
}
