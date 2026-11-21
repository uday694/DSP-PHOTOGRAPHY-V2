-- ============================================================================
-- DSP PHOTOGRAPHY V2 - LUXURY STUDIO SCHEMA (COMPATIBLE WITH EXISTING TABLES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name TEXT NOT NULL DEFAULT 'DSP PHOTOGRAPHY',
  tagline TEXT NOT NULL DEFAULT 'Capturing Moments. Creating Memories.',
  hero_headline TEXT NOT NULL DEFAULT 'Every Frame Tells A Story.',
  about_title TEXT NOT NULL DEFAULT 'The Art Of Light & Emotion',
  about_bio TEXT NOT NULL DEFAULT '[Editable Placeholder: Add your personal story, passion for visual storytelling, and years of experience via the Admin Dashboard.]',
  about_vision TEXT NOT NULL DEFAULT '[Editable Placeholder: Share your creative vision and what makes every shoot with DSP PHOTOGRAPHY unforgettable.]',
  about_skills TEXT NOT NULL DEFAULT 'Editorial Lighting, Candid Storytelling, Color Grading, 4K Cinema Direction',
  profile_photo_url TEXT DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '919000000000',
  phone_display TEXT NOT NULL DEFAULT '+91 90000 00000 [Update in Admin]',
  email TEXT NOT NULL DEFAULT 'contact@dspphotography.in',
  instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com',
  studio_location TEXT NOT NULL DEFAULT '[Your City / Studio Address - Edit in Admin]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.categories (name, sort_order) VALUES
  ('Wedding', 1),
  ('Pre-Wedding', 2),
  ('Portraits', 3),
  ('Fashion', 4),
  ('Events & Birthdays', 5),
  ('Product & Outdoor', 6)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  storage_path TEXT DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_label TEXT NOT NULL DEFAULT 'Custom Quote',
  icon_name TEXT NOT NULL DEFAULT 'Camera',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
