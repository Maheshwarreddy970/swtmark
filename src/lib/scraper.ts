// lib/scraper.ts
import { JSDOM } from 'jsdom';
import axios from 'axios';

interface InstagramData {
  latestPost: string;
  style: 'luxury' | 'professional' | 'standard';
  fallbackUsed: boolean;
}

export async function scrapeInstagramProfile(url: string): Promise<InstagramData> {
  const fallbackData: InstagramData = {
    latestPost: 'real estate properties',
    style: 'professional',
    fallbackUsed: true,
  };

  try {
    const dom = await JSDOM.fromURL(url, {
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
      beforeParse(window) {
        window.matchMedia = (query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        });
        window.scrollTo = () => {}; // Mock window.scrollTo to prevent error
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const doc = dom.window.document;
    const posts = Array.from(doc.querySelectorAll('article div[role="button"]'))
      .slice(0, 3)
      .map((post) => ({
        description: post.getAttribute('aria-label') || post.textContent || '',
      }));

    if (posts.length > 0) {
      return {
        latestPost: posts[0].description.substring(0, 100),
        style: posts.some((p) => p.description.toLowerCase().includes('luxury'))
          ? 'luxury'
          : 'professional',
        fallbackUsed: false,
      };
    }

    return fallbackData;
  } catch (error) {
    console.error('Scraping failed:', error);
    return fallbackData;
  }
}