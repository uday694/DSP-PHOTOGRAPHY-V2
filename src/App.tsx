import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Phone,
  Mail,
  Instagram,
  MapPin,
  MessageCircle,
  X,
  Menu,
  Sparkles,
  Award,
  Calendar,
  Star,
  ArrowUpRight,
  Send,
  Image as ImageIcon,
  Aperture,
  Zap,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import {
  supabase,
  DEFAULT_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_SERVICES,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_EVENTS,
  DEFAULT_REVIEWS,
} from './lib/supabase';
import {
  SiteSettings,
  Category,
  Photo,
  ServiceItem,
  Achievement,
  EventItem,
  ReviewItem,
} from './types';
import { BrandLogo } from './components/BrandLogo';
import { StudioScene3D } from './components/StudioScene3D';
import { AdminDashboard } from './components/AdminDashboard';

const EXTRA_STUDIO_SERVICES: ServiceItem[] = [
  {
    id: 'srv-drone-cinema',
    title: 'Drone Cinematography',
    price_label: 'Custom Package',
    description:
      '4K stabilized aerial drone coverage for grand weddings, pre-wedding shoots, baraats, and scenic outdoor venues.',
    sort_order: 98,
  },
  {
    id: 'srv-led-screen',
    title: 'LED Screen & Live Wall',
    price_label: 'Custom Package',
    description:
      'High-brightness indoor & outdoor P3/P4 LED video walls with live camera feed telecast and custom stage visuals.',
    sort_order: 99,
  },
];

export function App() {
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [isAdminRoute, setIsAdminRoute] = useState(
    () => window.location.pathname === '/admin' || window.location.hash === '#/admin'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive 3D Studio Controls
  const [cameraPreset, setCameraPreset] = useState<'hero' | 'lens' | 'gallery'>('hero');
  const [shutterFlash, setShutterFlash] = useState(0);

  // Live Studio State
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS);
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);

  // Gallery Filter & Lightbox Navigation
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // WhatsApp Booking Form State
  const [bookingService, setBookingService] = useState('Wedding Photography');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [requirements, setRequirements] = useState('');

  // Merge Drone & LED Screen services automatically if not already present
  const displayServices = useMemo(() => {
    const existingTitles = new Set(services.map((s) => s.title.toLowerCase()));
    const missingExtras = EXTRA_STUDIO_SERVICES.filter(
      (extra) =>
        !existingTitles.has(extra.title.toLowerCase()) &&
        !(
          extra.title.toLowerCase().includes('drone') &&
          [...existingTitles].some((t) => t.includes('drone'))
        ) &&
        !(
          extra.title.toLowerCase().includes('led') &&
          [...existingTitles].some((t) => t.includes('led'))
        )
    );
    return [...services, ...missingExtras];
  }, [services]);

  const fetchAllStudioData = async () => {
    if (!supabase) return;
    const [
      settingsRes,
      catRes,
      photosRes,
      servicesRes,
      achRes,
      eventsRes,
      reviewsRes,
    ] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).single(),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('photos').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('sort_order', { ascending: true }),
      supabase.from('achievements').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('event_date', { ascending: true }),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
    ]);

    if (settingsRes.data) setSettings(settingsRes.data);
    if (catRes.data?.length) setCategories(catRes.data);
    if (photosRes.data) setPhotos(photosRes.data);
    if (servicesRes.data?.length) setServices(servicesRes.data);
    if (achRes.data?.length) setAchievements(achRes.data);
    if (eventsRes.data?.length) setEvents(eventsRes.data);
    if (reviewsRes.data?.length) setReviews(reviewsRes.data);
  };

  useEffect(() => {
    fetchAllStudioData();
    const timer = setTimeout(() => setLoadingScreen(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Private Admin Shortcut (Ctrl + Shift + A) & Browser Back/Forward Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.history.pushState({}, '', '/admin');
        setIsAdminRoute(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    const handlePopState = () => {
      setIsAdminRoute(
        window.location.pathname === '/admin' || window.location.hash === '#/admin'
      );
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const exitAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, '') || '919000000000';
    const message = [
      Hello *${settings.brand_name}*! I would like to enquire about a photoshoot:,
      ``,
      *Service:* ${bookingService},
      *Name:* ${clientName},
      *Phone:* ${clientPhone},
      *Event Date:* ${eventDate || 'Flexible'},
      *Location:* ${eventLocation || 'To be discussed'},
      *Details:* ${requirements || 'Please share package details.'},
    ].join('\n');

    window.open(https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}, '_blank');
  };

  const publishedPhotos = photos.filter((p) => p.is_published);
  const filteredPhotos =
    activeCategory === 'ALL'
      ? publishedPhotos
      : publishedPhotos.filter((p) => p.category_id === activeCategory);

  const activeLightboxPhoto =
    lightboxIndex !== null && filteredPhotos[lightboxIndex]
      ? filteredPhotos[lightboxIndex]
      : null;

  if (isAdminRoute) {
    return (
      <AdminDashboard
        settings={settings}
        categories={categories}
        photos={photos}
        services={displayServices}
        achievements={achievements}
        events={events}
        reviews={reviews}
        onRefreshData={fetchAllStudioData}
        onExitAdmin={exitAdmin}
        setLocalSettings={setSettings}
        setLocalCategories={setCategories}
        setLocalPhotos={setPhotos}
        setLocalServices={setServices}
        setLocalAchievements={setAchievements}
        setLocalEvents={setEvents}
        setLocalReviews={setReviews}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#F7F6F2] relative">
      {/* Cinematic Branded Preloader */}
      <AnimatePresence>
        {loadingScreen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65 }}
            className="fixed inset-0 z-50 bg-[#050507] flex flex-col items-center justify-center gap-5"
          >
            <BrandLogo brandName={settings.brand_name} />
            <div className="w-52 h-[2px] bg-white/10 overflow-hidden rounded-full">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                className="w-full h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37]">
              Calibrating 3D Studio Optics...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Glass Navigation Bar (Public Visitors Only) */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#050507]/85 backdrop-blur-xl border-b border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <a href="#home">
            <BrandLogo brandName={settings.brand_name} />
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.24em] text-[#F7F6F2]/80">
            <a href="#home" className="hover:text-[#D4AF37] transition">Studio</a>
            <a href="#gallery" className="hover:text-[#D4AF37] transition">Exhibition</a>
            <a href="#services" className="hover:text-[#D4AF37] transition">Services</a>
            <a href="#process" className="hover:text-[#D4AF37] transition">Experience</a>
            <a href="#about" className="hover:text-[#D4AF37] transition">About</a>
            <a href="#booking" className="hover:text-[#D4AF37] transition">Reserve</a>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#booking"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6B3] text-[#050507] text-[11px] uppercase tracking-wider font-bold hover:brightness-110 transition shadow-lg shadow-[#D4AF37]/20"
            >
              Book a Shoot
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#F7F6F2]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0E0E12] border-b border-[#D4AF37]/25 px-6 py-6 space-y-4">
            {[
              { label: '3D Studio', href: '#home' },
              { label: 'Exhibition Gallery', href: '#gallery' },
              { label: 'Signature Services', href: '#services' },
              { label: 'Client Experience', href: '#process' },
              { label: 'About Studio', href: '#about' },
              { label: 'Book a Shoot', href: '#booking' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs uppercase tracking-[0.25em] text-[#F7F6F2] hover:text-[#D4AF37]"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* 1. INTERACTIVE 3D STUDIO HERO */}
      <section id="home" className="relative min-h-screen flex flex-col justify-between overflow-hidden pt-20 pb-8">
        <StudioScene3D
          photos={publishedPhotos.slice(0, 4)}
          onSelectPhoto={(photo) => {
            const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
            setLightboxIndex(idx >= 0 ? idx : 0);
          }}
          activePreset={cameraPreset}
          shutterFlash={shutterFlash}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]/65 pointer-events-none" />

        {/* Top Interactive Studio View Controls */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pt-4 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E0E12]/80 backdrop-blur-md border border-[#D4AF37]/30 text-[10px] uppercase tracking-[0.25em] text-[#F5E6B3]">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            Interactive 3D Studio • Drag to Orbit
          </div>

          <div className="flex items-center gap-2">
            {(
              [
                { id: 'hero', label: 'Studio View' },
                { id: 'lens', label: '85mm Prime' },
                { id: 'gallery', label: '3D Frames' },
              ] as const
            ).map((view) => (
              <button
                key={view.id}
                onClick={() => setCameraPreset(view.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition ${
                  cameraPreset === view.id
                    ? 'bg-[#D4AF37] text-[#050507] font-bold'
                    : 'bg-[#0E0E12]/80 text-[#8E8E93] border border-white/10 hover:text-white'
                }`}
              >
                {view.label}
              </button>
            ))}

            <button
              onClick={() => setShutterFlash((n) => n + 1)}
              className="px-3.5 py-1.5 rounded-full bg-[#0E0E12]/90 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#050507] transition flex items-center gap-1"
              title="Fire Studio Strobe Flash"
            >
              <Zap className="w-3 h-3" /> Flash
            </button>
          </div>
        </div>

        {/* Hero Headline & CTAs */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pointer-events-none mt-auto pt-44">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-xs sm:text-sm uppercase tracking-[0.42em] text-[#D4AF37] mb-3"
          >
            {settings.tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight gold-gradient-text drop-shadow-2xl"
          >
            {settings.hero_headline}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 pointer-events-auto"
          >
            <a
              href="#gallery"
              className="px-9 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6B3] text-[#050507] font-bold text-xs uppercase tracking-[0.22em] hover:brightness-110 transition shadow-[0_0_35px_rgba(212,175,55,0.35)]"
            >
              Explore Exhibition
            </a>
            <a
              href="#booking"
              className="px-9 py-4 rounded-full bg-[#0E0E12]/90 backdrop-blur-md border border-[#D4AF37]/50 text-[#F7F6F2] font-semibold text-xs uppercase tracking-[0.22em] hover:border-[#D4AF37] transition"
            >
              Reserve Your Date
            </a>
          </motion.div>
        </div>
      </section>

      {/* Luxury Brand Strip */}
      <div className="border-y border-[#D4AF37]/15 bg-[#0E0E12]/70 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] uppercase tracking-[0.3em] text-[#8E8E93]">
          <span className="flex items-center gap-2 text-[#F5E6B3]">
            <Aperture className="w-4 h-4 text-[#D4AF37]" /> 4K Cinema Pipeline
          </span>
          <span>•</span>
          <span>4K Aerial Drone</span>
          <span>•</span>
          <span>HD LED Live Walls</span>
          <span>•</span>
          <span>Master Prime Optics</span>
          <span>•</span>
          <span>Heirloom Fine-Art Albums</span>
        </div>
      </div>

      {/* 2. EXHIBITION PORTFOLIO GALLERY */}
      <section id="gallery" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
              Curated Visual Stories
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-bold mt-2">
              Studio Exhibition
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition ${
                activeCategory === 'ALL'
                  ? 'bg-[#D4AF37] text-[#050507] font-bold'
                  : 'bg-[#0E0E12] text-[#8E8E93] border border-white/10 hover:text-white'
              }`}
            >
              All Frames ({publishedPhotos.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition ${
                  activeCategory === cat.id
                    ? 'bg-[#D4AF37] text-[#050507] font-bold'
                    : 'bg-[#0E0E12] text-[#8E8E93] border border-white/10 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="luxury-card rounded-3xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-5">
              <ImageIcon className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <h3 className="font-display text-3xl font-bold text-white">
              Exhibition Curating in Progress
            </h3>
            <p className="text-sm text-[#8E8E93] mt-2 leading-relaxed">
              New fine-art frames and wedding stories are being prepared for display. Reserve your session below or check back soon.
            </p>
            <a
              href="#booking"
              className="inline-block mt-6 px-8 py-3.5 rounded-full bg-[#D4AF37] text-[#050507] font-bold text-xs uppercase tracking-widest hover:bg-[#F5E6B3] transition"
            >
              Book a Consultation
            </a>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredPhotos.map((photo, index) => {
              const catName =
                categories.find((c) => c.id === photo.category_id)?.name || 'DSP Studio';
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  key={photo.id}
                  onClick={() => setLightboxIndex(index)}
                  className="break-inside-avoid group relative rounded-2xl overflow-hidden luxury-card cursor-pointer"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
                      {catName}
                    </span>
                    <h4 className="font-display text-2xl font-bold text-white mt-0.5">
                      {photo.title}
                    </h4>
                    {photo.description && (
                      <p className="text-xs text-white/75 mt-1 line-clamp-2">{photo.description}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Fullscreen Lightbox with Previous / Next Controls */}
      <AnimatePresence>
        {activeLightboxPhoto && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-[#D4AF37] hover:text-black transition z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {filteredPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(
                      (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
                    );
                  }}
                  className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 text-white hover:bg-[#D4AF37] hover:text-black transition z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
                  }}
                  className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 text-white hover:bg-[#D4AF37] hover:text-black transition z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full flex flex-col items-center"
            >
              <img
                src={activeLightboxPhoto.image_url}
                alt={activeLightboxPhoto.title}
                className="max-h-[78vh] w-auto rounded-xl border border-[#D4AF37]/40 shadow-2xl"
              />
              <div className="mt-4 text-center max-w-xl">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F6F2]">
                  {activeLightboxPhoto.title}
                </h3>
                {activeLightboxPhoto.description && (
                  <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
                    {activeLightboxPhoto.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SIGNATURE SERVICES (Includes Drone Cinematography & LED Screen) */}
      <section id="services" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
            Bespoke Commissions
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-bold mt-2">
            Signature Services
          </h2>
          <p className="text-sm text-[#8E8E93] mt-3">
            Crafted with cinema-grade lighting, 4K aerial drones, live LED walls, and personalized care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((srv, index) => (
            <div
              key={srv.id}
              className="group luxury-card rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="font-display text-2xl text-[#D4AF37]/40 font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-[#F7F6F2]">{srv.title}</h3>
                <p className="text-xs text-[#D4AF37] font-medium mt-1">{srv.price_label}</p>
                <p className="text-sm text-[#8E8E93] mt-3 leading-relaxed">{srv.description}</p>
              </div>

              <a
                href="#booking"
                onClick={() => setBookingService(srv.title)}
                className="mt-7 pt-4 border-t border-white/10 inline-flex items-center justify-between text-xs uppercase tracking-widest text-[#F5E6B3] group-hover:text-[#D4AF37]"
              >
                <span>Request Availability</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CLIENT EXPERIENCE WORKFLOW */}
      <section id="process" className="py-20 px-4 sm:px-6 bg-[#0E0E12]/70 border-y border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
              How We Work
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mt-2">
              The DSP Studio Experience
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Creative Consultation',
                desc: 'We discuss your event timeline, moodboards, outfits, and lighting concepts.',
              },
              {
                step: '02',
                title: 'Cinematic Production',
                desc: 'Full-frame master prime lenses, 4K aerial drones, LED screens, and studio strobes.',
              },
              {
                step: '03',
                title: 'Editorial Color Grading',
                desc: 'Every frame is individually retouched and color-graded in our signature luxury tone.',
              },
              {
                step: '04',
                title: 'Private Cloud & Albums',
                desc: 'High-resolution digital gallery delivery alongside handcrafted fine-art albums.',
              },
            ].map((item) => (
              <div key={item.step} className="luxury-card rounded-2xl p-6 space-y-3">
                <span className="font-display text-3xl font-bold text-[#D4AF37]">
                  {item.step}
                </span>
                <h3 className="font-display text-2xl font-bold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ABOUT THE STUDIO */}
      <section id="about" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden luxury-card p-3">
              {settings.profile_photo_url ? (
                <img
                  src={settings.profile_photo_url}
                  alt={settings.brand_name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-[#050507] flex flex-col items-center justify-center p-6 text-center">
                  <Camera className="w-12 h-12 text-[#D4AF37] mb-3" />
                  <p className="text-xs uppercase tracking-widest text-[#D4AF37]">
                    Lead Photographer Portrait
                  </p>
                  <p className="text-xs text-[#8E8E93] mt-2">
                    DSP Photography Studio
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
              {settings.brand_name}
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-bold">
              {settings.about_title}
            </h2>
            <p className="text-sm sm:text-base text-[#F7F6F2]/85 leading-relaxed">
              {settings.about_bio}
            </p>
            <div className="p-5 rounded-2xl bg-[#0E0E12] border-l-2 border-[#D4AF37]">
              <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] block mb-1">
                Director's Vision
              </span>
              <p className="text-sm text-[#8E8E93] italic">"{settings.about_vision}"</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8E8E93] block mb-3">
                Core Specialties
              </span>
              <div className="flex flex-wrap gap-2">
                {[...settings.about_skills.split(','), '4K Drone Cinematography', 'LED Live Screens'].map(
                  (skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E0E12] border border-[#D4AF37]/30 text-xs text-[#F5E6B3]"
                    >
                      <Check className="w-3 h-3 text-[#D4AF37]" /> {skill.trim()}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ACHIEVEMENTS, EVENTS & REVIEWS */}
      <section id="achievements" className="py-24 px-4 sm:px-6 bg-[#0E0E12]/55 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] flex items-center gap-2">
              <Award className="w-4 h-4" /> Recognition
            </span>
            <h3 className="font-display text-3xl font-bold">Achievements</h3>
            <div className="space-y-4 pt-2">
              {achievements.map((a) => (
                <div key={a.id} className="p-5 rounded-2xl luxury-card">
                  <span className="text-xs text-[#D4AF37]">{a.year} • {a.issuer}</span>
                  <h4 className="font-semibold text-base text-white mt-1">{a.title}</h4>
                  {a.description && (
                    <p className="text-xs text-[#8E8E93] mt-2 leading-relaxed">{a.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Calendar
            </span>
            <h3 className="font-display text-3xl font-bold">Studio Events</h3>
            <div className="space-y-4 pt-2">
              {events.map((ev) => (
                <div key={ev.id} className="p-5 rounded-2xl luxury-card">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#D4AF37]">{ev.event_date}</span>
                    <span className="uppercase px-2 py-0.5 rounded bg-white/5 text-[10px]">
                      {ev.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-base text-white mt-1.5">{ev.title}</h4>
                  <p className="text-xs text-[#8E8E93] mt-1">{ev.location}</p>
                  {ev.description && (
                    <p className="text-xs text-[#8E8E93] mt-2">{ev.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] flex items-center gap-2">
              <Star className="w-4 h-4" /> Client Love
            </span>
            <h3 className="font-display text-3xl font-bold">Testimonials</h3>
            <div className="space-y-4 pt-2">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl luxury-card">
                  <div className="flex gap-1 text-[#D4AF37] mb-2">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#F7F6F2]/85 italic">"{rev.review_text}"</p>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs font-semibold text-white">{rev.client_name}</div>
                    <div className="text-[11px] text-[#D4AF37]">{rev.service_type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHATSAPP BOOKING & STUDIO CONTACT */}
      <section id="booking" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
              Private Concierge
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              Reserve Your Session
            </h2>
            <p className="text-sm text-[#8E8E93] leading-relaxed">
              Submit your event details below to open a direct WhatsApp consultation with our booking desk.
            </p>

            <div className="space-y-4 pt-2 text-sm">
              <div className="flex items-center gap-3 text-[#F7F6F2]/90">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>{settings.phone_display}</span>
              </div>
              <div className="flex items-center gap-3 text-[#F7F6F2]/90">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[#F7F6F2]/90">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>{settings.studio_location}</span>
              </div>
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[#D4AF37] hover:underline pt-1"
              >
                <Instagram className="w-4 h-4" /> Follow on Instagram
              </a>
            </div>
          </div>

          <form
            onSubmit={handleWhatsAppBooking}
            className="lg:col-span-7 luxury-card rounded-3xl p-6 sm:p-8 space-y-4"
          >
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Direct WhatsApp Booking Enquiry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1.5">Select Service</label>
                <select
                  value={bookingService}
                  onChange={(e) => setBookingService(e.target.value)}
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
                >
                  {displayServices.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1.5">Your Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1.5">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8E8E93] mb-1.5">Event Venue / City</label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="e.g. Hyderabad / Nalgonda / Destination"
                className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8E8E93] mb-1.5">Shoot Requirements</label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Share your event dates, number of sessions, or vision..."
                className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5E6B3] text-[#050507] font-bold text-xs uppercase tracking-[0.22em] hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/25"
            >
              <Send className="w-4 h-4" /> Send Enquiry via WhatsApp
            </button>
          </form>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="border-t border-[#D4AF37]/15 py-12 px-4 text-center text-xs text-[#8E8E93]">
        <div className="flex justify-center mb-4">
          <BrandLogo brandName={settings.brand_name} compact />
        </div>
        <p className="text-[#F7F6F2] font-semibold tracking-[0.3em] uppercase">
          {settings.brand_name} — {settings.tagline}
        </p>
        <p className="mt-2">© {new Date().getFullYear()} {settings.brand_name}. All rights reserved.</p>
      </footer>

      {/* Floating WhatsApp Concierge Button */}
      <a
        href={https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '') || '919000000000'}}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-7 h-7 fill-black" />
      </a>
    </div>
  );
}
