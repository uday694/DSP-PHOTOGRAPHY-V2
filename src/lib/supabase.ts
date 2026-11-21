import { createClient } from '@supabase/supabase-js';
import { SiteSettings, Category, ServiceItem, Achievement, EventItem, ReviewItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-publishable-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function compressImageForWeb(file: File, maxDimension = 2200, quality = 0.88): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  brand_name: 'DSP PHOTOGRAPHY',
  tagline: 'Capturing Moments. Creating Memories.',
  hero_headline: 'Every Frame Tells A Story.',
  about_title: 'The Art Of Light & Emotion',
  about_bio:
    '[Editable Placeholder] Welcome to DSP PHOTOGRAPHY. Open Studio Admin from your mobile or laptop to add your personal story, artistic philosophy, and journey behind the camera.',
  about_vision:
    '[Editable Placeholder] Every glance, celebration, and quiet emotion deserves timeless cinematic framing.',
  about_skills: 'Editorial Lighting, Candid Storytelling, Cinema Color Grading, 4K Production',
  profile_photo_url: '',
  whatsapp_number: '919000000000',
  phone_display: '+91 90000 00000 [Edit in Admin]',
  email: 'contact@dspphotography.in',
  instagram_url: 'https://instagram.com',
  studio_location: '[Your Studio City & Address — Edit in Admin]',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Wedding', sort_order: 1 },
  { id: 'cat-2', name: 'Pre-Wedding', sort_order: 2 },
  { id: 'cat-3', name: 'Portraits', sort_order: 3 },
  { id: 'cat-4', name: 'Fashion', sort_order: 4 },
  { id: 'cat-5', name: 'Events & Birthdays', sort_order: 5 },
  { id: 'cat-6', name: 'Product & Outdoor', sort_order: 6 },
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 's1', title: 'Wedding Photography', description: 'Bespoke multi-day coverage capturing sacred rituals, unscripted emotion, and heirloom portraiture.', price_label: 'Custom Package [Edit in Admin]', icon_name: 'Heart', sort_order: 1 },
  { id: 's2', title: 'Pre-Wedding Photography', description: 'Editorial couple films and dramatic destination shoots crafted with natural & sculpted light.', price_label: 'Custom Package [Edit in Admin]', icon_name: 'Sparkles', sort_order: 2 },
  { id: 's3', title: 'Birthday Photography', description: 'Vibrant milestone celebrations documented with candid warmth and crisp studio detail.', price_label: 'Custom Package [Edit in Admin]', icon_name: 'Gift', sort_order: 3 },
  { id: 's4', title: 'Event Photography', description: 'Engagements, luxury galas, cultural ceremonies, and private VIP gatherings.', price_label: 'Custom Package [Edit in Admin]', icon_name: 'Calendar', sort_order: 4 },
  { id: 's5', title: 'Portrait Photography', description: 'Fine-art studio and natural-light portraits designed to reflect unmistakable presence.', price_label: 'Custom Package [Edit in Admin]', icon_name: 'User', sort_order: 5 },
  { id: 's6', title: 'Fashion Photography', description: 'High-contrast lookbooks, designer campaigns, and editorial model portfolios.', price_label: 'Custom Package [Edit in Admin]', icon_name: 'Aperture', sort_order: 6 },
  { id: 's7', title: 'Product Photography', description: 'Macro precision and luxury lighting for jewelry, watches, apparel, and commercial brands.', price_label: 'Custom Package [Edit in Admin]', icon_name: 'Package', sort_order: 7 },
  { id: 's8', title: 'Outdoor Photography', description: 'Golden-hour sessions across architectural landmarks and scenic landscapes.', price_label: 'Custom Package [Edit in Admin]', icon_name: 'Sun', sort_order: 8 },
  { id: 's9', title: 'Cinematic Videography', description: '4K cinema teasers, wedding documentaries, and reels graded in Hollywood color pipelines.', price_label: 'Custom Package [Edit in Admin]', icon_name: 'Film', sort_order: 9 },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    title: '[Sample Milestone — Replace in Admin]',
    issuer: 'Award / Certification Authority',
    year: '2026',
    description: 'Add your verified awards, photography certifications, or milestone achievements in the Admin Dashboard.',
  },
];

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: '[Sample Upcoming Showcase — Edit in Admin]',
    event_date: '2026-12-20',
    location: 'Studio / Exhibition Venue',
    description: 'Manage upcoming and past photography showcases directly from your mobile dashboard.',
    cover_url: '',
    status: 'upcoming',
  },
];

export const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    client_name: '[Sample Client Placeholder — Replace in Admin]',
    service_type: 'Wedding Photography',
    rating: 5,
    review_text: 'Clearly labelled placeholder. Add genuine reviews from your real clients via the Admin Dashboard.',
  },
];
