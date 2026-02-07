// services/linkedinService.ts

export interface LinkedInRawProfile {
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: string;
  industry: string;
  positions: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills: Array<{
    name: string;
    endorsements?: number;
  }>;
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export class LinkedInService {
  // الطريقة 1: استخدام RapidAPI (مقترح)
  static async fetchProfileViaRapidAPI(profileUrl: string): Promise<LinkedInRawProfile> {
    // Safely access process.env to avoid ReferenceError in browser
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.RAPIDAPI_KEY : undefined;
    
    // Check if API key is missing or default
    if (!apiKey || apiKey === 'YOUR_RAPIDAPI_KEY') {
      // Throwing specifically to trigger the simulation fallback immediately
      throw new Error('RapidAPI key is missing or invalid. Falling back to simulation.');
    }
    
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'linkedin-api8.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(
        `https://linkedin-api8.p.rapidapi.com/?url=${encodeURIComponent(profileUrl)}`,
        options
      );
      
      if (!response.ok) {
         // Log detail for debugging but throw simple error for UI
         console.warn(`RapidAPI fetch failed with status: ${response.status}`);
         throw new Error('Failed to fetch LinkedIn data via RapidAPI');
      }
      
      return await response.json();
    } catch (error) {
      // Re-throw to be caught by the component
      throw error;
    }
  }

  // الطريقة 2: استخدام LinkedIn Scraper (يتطلب backend)
  static async scrapeProfile(profileUrl: string): Promise<LinkedInRawProfile> {
    const response = await fetch('http://localhost:3000/api/linkedin/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: profileUrl })
    });

    if (!response.ok) throw new Error('Scraping failed');
    
    return response.json();
  }

  // الطريقة 3: LinkedIn OEmbed (للبيانات المحدودة)
  static async getOEmbedData(profileUrl: string) {
    try {
      const response = await fetch(
        `https://www.linkedin.com/embed/feed/update/${this.extractPostId(profileUrl)}`
      );
      
      if (!response.ok) throw new Error('OEmbed failed');
      
      const html = await response.text();
      return this.parseOEmbedHTML(html);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private static extractPostId(url: string): string {
    const match = url.match(/activity-(\d+)/);
    return match ? match[1] : '';
  }

  private static parseOEmbedHTML(html: string): any {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    return {
      author: doc.querySelector('.feed-shared-actor__name')?.textContent,
      headline: doc.querySelector('.feed-shared-actor__description')?.textContent,
      content: doc.querySelector('.feed-shared-text')?.textContent
    };
  }

  // دالة للمعالجة واستخراج البيانات ذات الصلة وتنسيقها بما يتوافق مع التطبيق
  static processProfileData(profile: LinkedInRawProfile) {
    return {
      name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      headline: profile.headline || '',
      summary: profile.summary || '',
      skills: profile.skills?.map(skill => skill.name) || [],
      experience: profile.positions?.map(pos => 
        `${pos.title} at ${pos.company}`
      ) || [],
      education: profile.education?.map(edu => 
        `${edu.degree} at ${edu.school}`
      ) || []
    };
  }
}