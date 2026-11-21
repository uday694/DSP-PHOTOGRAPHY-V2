export interface SiteSettings {
  id: number;
  brand_name: string;
  tagline: string;
  hero_headline: string;
  about_title: string;
  about_bio: string;
  about_vision: string;
  about_skills: string;
  profile_photo_url: string;
  whatsapp_number: string;
  phone_display: string;
  email: string;
  instagram_url: string;
  studio_location: string;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  image_url: string;
  storage_path: string;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price_label: string;
  icon_name: string;
  sort_order: number;
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description: string;
}

export interface EventItem {
  id: string;
  title: string;
  event_date: string;
  location: string;
  description: string;
  cover_url: string;
  status: 'upcoming' | 'past';
}

export interface ReviewItem {
  id: string;
  client_name: string;
  service_type: string;
  rating: number;
  review_text: string;
}
