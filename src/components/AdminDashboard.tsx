import React, { useState } from 'react';
import {
  Upload,
  Trash2,
  frames,
  Eye,
  EyeOff,
  Plus,
  LogOut,
  Image as ImageIcon,
  FolderPlus,
  Briefcase,
  UserCheck,
  Award,
  Calendar,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Sparkles,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, compressImageForWeb } from '../lib/supabase';
import {
  SiteSettings,
  Category,
  Photo,
  ServiceItem,
  Achievement,
  Drone,
  Led screen;
  EventItem,
  ReviewItem,
} from '../types';
import { BrandLogo } from './BrandLogo';

interface AdminDashboardProps {
  settings: SiteSettings;
  categories: Category[];
  photos: Photo[];
  services: ServiceItem[];
  achievements: Achievement[];
  events: EventItem[];
  reviews: ReviewItem[];
  onRefreshData: () => Promise<void>;
  onExitAdmin: () => void;
  setLocalSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  setLocalCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setLocalPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  setLocalServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  setLocalAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  setLocalEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  setLocalReviews: React.Dispatch<React.SetStateAction<ReviewItem[]>>;
}

type AdminTab = 'photos' | 'categories' | 'services' | 'profile' | 'milestones';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  categories,
  photos,
  services,
  achievements,
  events,
  reviews,
  onRefreshData,
  onExitAdmin,
  setLocalSettings,
  setLocalCategories,
  setLocalPhotos,
  setLocalServices,
  setLocalAchievements,
  setLocalEvents,
  setLocalReviews,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!isSupabaseConfigured);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('photos');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoCategoryId, setPhotoCategoryId] = useState<string>(categories[0]?.id || '');
  const [uploading, setUploading] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const [formSettings, setFormSettings] = useState<SiteSettings>(settings);

  const [achTitle, setAchTitle] = useState('');
  const [achIssuer, setAchIssuer] = useState('');
  const [achYear, setAchYear] = useState('2026');
  const [achDesc, setAchDesc] = useState('');

  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evStatus, setEvStatus] = useState<'upcoming' | 'past'>('upcoming');

  const [revName, setRevName] = useState('');
  const [revService, setRevService] = useState('Wedding Photography');
  const [revText, setRevText] = useState('');

  const notify = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4500);
  };

  React.useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsAuthenticated(true);
    });
  }, []);

  React.useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setIsAuthenticated(true);
      return;
    }
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) {
      notify('error', error.message);
    } else {
      setIsAuthenticated(true);
      notify('success', 'Signed in to DSP PHOTOGRAPHY Studio Control.');
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsAuthenticated(false);
    onExitAdmin();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleUploadPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      notify('error', 'Please choose at least one photo first.');
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const titleToUse =
          selectedFiles.length === 1 && photoTitle.trim()
            ? photoTitle.trim()
            : photoTitle.trim()
            ? `${photoTitle.trim()} (${i + 1})`
            : file.name.replace(/\.[^/.]+$/, '');

        if (supabase) {
          const compressedBlob = await compressImageForWeb(file);
          const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

          const { error: uploadError } = await supabase.storage
            .from('portfolio-images')
            .upload(filePath, compressedBlob, { contentType: 'image/webp' });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(filePath);

          const { error: dbError } = await supabase.from('photos').insert({
            title: titleToUse,
            description: photoDesc.trim(),
            image_url: publicUrlData.publicUrl,
            storage_path: filePath,
            category_id: photoCategoryId || null,
            is_published: true,
            sort_order: photos.length + i,
          });

          if (dbError) throw dbError;
        } else {
          const readerUrl = URL.createObjectURL(file);
          const newPhoto: Photo = {
            id: `local-${Date.now()}-${i}`,
            title: titleToUse,
            description: photoDesc.trim(),
            image_url: readerUrl,
            storage_path: '',
            category_id: photoCategoryId || categories[0]?.id || null,
            is_published: true,
            is_featured: false,
            sort_order: photos.length + i,
            created_at: new Date().toISOString(),
          };
          setLocalPhotos((prev) => [newPhoto, ...prev]);
        }
      }

      if (supabase) await onRefreshData();
      setSelectedFiles([]);
      setPreviews([]);
      setPhotoTitle('');
      setPhotoDesc('');
      notify('success', `${selectedFiles.length} photograph(s) published live!`);
    } catch (err: any) {
      notify('error', err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const togglePublishPhoto = async (photo: Photo) => {
    if (supabase) {
      await supabase.from('photos').update({ is_published: !photo.is_published }).eq('id', photo.id);
      await onRefreshData();
    } else {
      setLocalPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, is_published: !p.is_published } : p))
      );
    }
    notify('success', photo.is_published ? 'Hidden from public gallery.' : 'Published live!');
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!window.confirm(`Delete "${photo.title}" permanently?`)) return;
    if (supabase) {
      if (photo.storage_path) {
        await supabase.storage.from('portfolio-images').remove([photo.storage_path]);
      }
      await supabase.from('photos').delete().eq('id', photo.id);
      await onRefreshData();
    } else {
      setLocalPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    }
    notify('success', 'Photograph removed.');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (supabase) {
      const { error } = await supabase
        .from('categories')
        .insert({ name: newCategoryName.trim(), sort_order: categories.length + 1 });
      if (error) return notify('error', error.message);
      await onRefreshData();
    } else {
      setLocalCategories((prev) => [
        ...prev,
        { id: `cat-${Date.now()}`, name: newCategoryName.trim(), sort_order: prev.length + 1 },
      ]);
    }
    setNewCategoryName('');
    notify('success', 'Category created.');
  };

  const handleDeleteCategory = async (id: string) => {
    if (supabase) {
      await supabase.from('categories').delete().eq('id', id);
      await onRefreshData();
    } else {
      setLocalCategories((prev) => prev.filter((c) => c.id !== id));
    }
    notify('success', 'Category deleted.');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle.trim()) return;
    if (supabase) {
      await supabase.from('services').insert({
        title: newServiceTitle.trim(),
        description: newServiceDesc.trim() || 'Bespoke photography & cinema production.',
        price_label: newServicePrice.trim() || 'Custom Package',
        sort_order: services.length + 1,
      });
      await onRefreshData();
    } else {
      setLocalServices((prev) => [
        ...prev,
        {
          id: `srv-${Date.now()}`,
          title: newServiceTitle.trim(),
          description: newServiceDesc.trim() || 'Bespoke photography service.',
          price_label: newServicePrice.trim() || 'Custom Package',
          icon_name: 'Camera',
          sort_order: prev.length + 1,
        },
      ]);
    }
    setNewServiceTitle('');
    setNewServiceDesc('');
    setNewServicePrice('');
    notify('success', 'Service added.');
  };

  const handleDeleteService = async (id: string) => {
    if (supabase) {
      await supabase.from('services').delete().eq('id', id);
      await onRefreshData();
    } else {
      setLocalServices((prev) => prev.filter((s) => s.id !== id));
    }
    notify('success', 'Service removed.');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supabase) {
      const { error } = await supabase.from('site_settings').upsert({ ...formSettings, id: 1 });
      if (error) return notify('error', error.message);
      await onRefreshData();
    } else {
      setLocalSettings(formSettings);
    }
    notify('success', 'Studio profile & WhatsApp contact updated!');
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (supabase) {
      const compressed = await compressImageForWeb(file, 1000, 0.9);
      const path = `profile/avatar-${Date.now()}.webp`;
      const { error } = await supabase.storage
        .from('portfolio-images')
        .upload(path, compressed, { contentType: 'image/webp' });
      if (error) return notify('error', error.message);
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(path);
      const updated = { ...formSettings, profile_photo_url: data.publicUrl };
      setFormSettings(updated);
      await supabase.from('site_settings').upsert({ ...updated, id: 1 });
      await onRefreshData();
      notify('success', 'Portrait photo updated!');
    } else {
      const localUrl = URL.createObjectURL(file);
      const updated = { ...formSettings, profile_photo_url: localUrl };
      setFormSettings(updated);
      setLocalSettings(updated);
      notify('success', 'Portrait photo updated!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center px-4">
        <div className="w-full max-w-md luxury-card rounded-3xl p-8">
          <div className="flex justify-center mb-6">
            <BrandLogo brandName={settings.brand_name} />
          </div>
          <h2 className="text-3xl font-display font-bold text-center text-[#F7F6F2] mb-2">
            Studio Owner Access
          </h2>
          <p className="text-xs text-center text-[#8E8E93] mb-6">
            Sign in with your authorized Studio Admin email & password.
          </p>

          {statusMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs">
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#8E8E93] mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="udaykirandevasani24@gmail.com"
                className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#8E8E93] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-[#D4AF37] text-[#050507] font-semibold text-xs uppercase tracking-widest hover:bg-[#F5E6B3] transition"
            >
              {authLoading ? 'Authenticating...' : 'Enter Studio Control'}
            </button>
          </form>

          <button
            onClick={onExitAdmin}
            className="mt-6 w-full flex items-center justify-center gap-2 text-xs text-[#8E8E93] hover:text-[#D4AF37]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#F7F6F2] pb-24">
      <header className="sticky top-0 z-40 bg-[#0E0E12]/95 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo brandName={settings.brand_name} compact />
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] block">
                Owner Control Panel
              </span>
              <h1 className="text-lg font-display font-bold leading-tight">
                {settings.brand_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExitAdmin}
              className="px-3.5 py-2 rounded-lg border border-white/15 text-xs font-medium hover:border-[#D4AF37] transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> View Live Site
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/25 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {!isSupabaseConfigured && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <strong>Preview Mode Active:</strong> Connect your Supabase URL & Key in Vercel Environment Variables so uploads save permanently across all devices.
            </div>
          </div>
        </div>
      )}

      {statusMsg && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#0E0E12] border border-[#D4AF37] text-[#F7F6F2] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm">
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {[
            { id: 'photos', label: 'Photos & Upload', icon: ImageIcon },
            { id: 'categories', label: 'Categories', icon: FolderPlus },
            { id: 'services', label: 'Services & Prices', icon: Briefcase },
            { id: 'profile', label: 'About & Contact', icon: UserCheck },
            { id: 'milestones', label: 'Reviews & Events', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? 'bg-[#D4AF37] text-[#050507] font-semibold shadow-lg shadow-[#D4AF37]/20'
                    : 'bg-[#0E0E12] text-[#8E8E93] border border-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-6">
        {activeTab === 'photos' && (
          <div className="space-y-8">
            <form
              onSubmit={handleUploadPhotos}
              className="luxury-card rounded-2xl p-5 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-[#D4AF37]">
                  Publish New Photographs
                </h2>
                <span className="text-xs text-[#8E8E93]">Auto-optimized WebP</span>
              </div>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-2xl p-7 cursor-pointer bg-[#050507]/70 transition text-center">
                <Upload className="w-9 h-9 text-[#D4AF37] mb-2" />
                <span className="text-sm font-medium text-[#F7F6F2]">
                  Tap to Select Photos from Phone or Computer
                </span>
                <span className="text-xs text-[#8E8E93] mt-1">
                  JPG, JPEG, PNG, WebP • Batch upload supported
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#D4AF37]/40"
                    >
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8E8E93] mb-1.5">
                    Photo Title / Collection Name
                  </label>
                  <input
                    type="text"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    placeholder="e.g. Royal Bridal Portrait"
                    className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8E8E93] mb-1.5">Category</label>
                  <select
                    value={photoCategoryId}
                    onChange={(e) => setPhotoCategoryId(e.target.value)}
                    className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8E8E93] mb-1.5">
                  Caption / Lens Story (Optional)
                </label>
                <input
                  type="text"
                  value={photoDesc}
                  onChange={(e) => setPhotoDesc(e.target.value)}
                  placeholder="e.g. Captured on 85mm f/1.2 Prime at Sunset"
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D4AF37] text-[#050507] font-semibold text-xs uppercase tracking-widest hover:bg-[#F5E6B3] disabled:opacity-40 transition flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading
                  ? 'Optimizing & Publishing...'
                  : `Publish ${selectedFiles.length || ''} Photo(s) Live`}
              </button>
            </form>

            <div>
              <h3 className="text-xl font-display font-bold mb-4">
                Published & Draft Frames ({photos.length})
              </h3>
              {photos.length === 0 ? (
                <div className="luxury-card rounded-2xl p-8 text-center text-sm text-[#8E8E93]">
                  Your gallery is ready for your first upload above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((photo) => {
                    const catName =
                      categories.find((c) => c.id === photo.category_id)?.name || 'General';
                    return (
                      <div
                        key={photo.id}
                        className="luxury-card rounded-2xl overflow-hidden flex flex-col"
                      >
                        <div className="relative aspect-[4/3] bg-black">
                          <img
                            src={photo.image_url}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              photo.is_published
                                ? 'bg-emerald-500/90 text-black'
                                : 'bg-zinc-800/90 text-zinc-300'
                            }`}
                          >
                            {photo.is_published ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div>
                            <span className="text-[11px] text-[#D4AF37] uppercase tracking-wider">
                              {catName}
                            </span>
                            <h4 className="font-semibold text-sm text-white mt-0.5">
                              {photo.title}
                            </h4>
                            {photo.description && (
                              <p className="text-xs text-[#8E8E93] mt-1 line-clamp-2">
                                {photo.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <button
                              onClick={() => togglePublishPhoto(photo)}
                              className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center gap-1.5"
                            >
                              {photo.is_published ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" /> Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> Publish
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeletePhoto(photo)}
                              className="py-2 px-3 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="luxury-card rounded-2xl p-6 max-w-2xl space-y-6">
            <h2 className="text-2xl font-display font-bold text-[#D4AF37]">
              Gallery Categories
            </h2>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category (e.g. Candid Wedding)"
                className="flex-1 bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-[#D4AF37] text-[#050507] font-semibold text-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between bg-[#050507] border border-white/10 px-4 py-3 rounded-xl"
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-400 hover:text-red-300 p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <form onSubmit={handleAddService} className="luxury-card rounded-2xl p-6 space-y-4">
              <h2 className="text-2xl font-display font-bold text-[#D4AF37]">
                Add Signature Service
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  placeholder="Service Title (e.g. Drone Aerial Cinema)"
                  className="bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                />
                <input
                  type="text"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="Price Label (e.g. Starting ₹25,000 or Custom Quote)"
                  className="bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                />
              </div>
              <input
                type="text"
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                placeholder="Deliverables & description"
                className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#050507] font-semibold text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="luxury-card rounded-2xl p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <h4 className="font-semibold text-base text-white">{srv.title}</h4>
                    <span className="text-xs text-[#D4AF37] block mt-0.5">{srv.price_label}</span>
                    <p className="text-xs text-[#8E8E93] mt-2">{srv.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteService(srv.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveSettings}
            className="luxury-card rounded-2xl p-6 space-y-5 max-w-3xl"
          >
            <h2 className="text-2xl font-display font-bold text-[#D4AF37]">
              Edit Brand, About Me & WhatsApp Number
            </h2>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#050507] border border-white/10">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-900 border border-[#D4AF37]/40 shrink-0 flex items-center justify-center">
                {formSettings.profile_photo_url ? (
                  <img
                    src={formSettings.profile_photo_url}
                    alt="Photographer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCheck className="w-7 h-7 text-[#D4AF37]" />
                )}
              </div>
              <div>
                <label className="inline-block px-4 py-2 rounded-lg bg-[#D4AF37] text-[#050507] text-xs font-semibold cursor-pointer">
                  Upload Photographer Portrait
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-[#8E8E93] mt-1">
                  Displayed in the About Me section.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1">Hero Headline</label>
                <input
                  type="text"
                  value={formSettings.hero_headline}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, hero_headline: e.target.value })
                  }
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1">Tagline</label>
                <input
                  type="text"
                  value={formSettings.tagline}
                  onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8E8E93] mb-1">About Me / Journey</label>
              <textarea
                rows={3}
                value={formSettings.about_bio}
                onChange={(e) => setFormSettings({ ...formSettings, about_bio: e.target.value })}
                className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8E8E93] mb-1">Creative Vision</label>
              <textarea
                rows={2}
                value={formSettings.about_vision}
                onChange={(e) => setFormSettings({ ...formSettings, about_vision: e.target.value })}
                className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1">
                  WhatsApp Number (Country code + digits, e.g. 919876543210)
                </label>
                <input
                  type="text"
                  value={formSettings.whatsapp_number}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, whatsapp_number: e.target.value })
                  }
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1">Display Phone Number</label>
                <input
                  type="text"
                  value={formSettings.phone_display}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, phone_display: e.target.value })
                  }
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1">Email Address</label>
                <input
                  type="email"
                  value={formSettings.email}
                  onChange={(e) => setFormSettings({ ...formSettings, email: e.target.value })}
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1">Instagram Link</label>
                <input
                  type="url"
                  value={formSettings.instagram_url}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, instagram_url: e.target.value })
                  }
                  className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8E8E93] mb-1">Studio Location</label>
              <input
                type="text"
                value={formSettings.studio_location}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, studio_location: e.target.value })
                }
                className="w-full bg-[#050507] border border-white/15 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-[#D4AF37] text-[#050507] font-semibold text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save All Profile Changes
            </button>
          </form>
        )}

        {activeTab === 'milestones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="luxury-card rounded-2xl p-5 space-y-4">
              <h3 className="font-display text-xl font-bold text-[#D4AF37] flex items-center gap-2">
                <Award className="w-4 h-4" /> Achievements
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!achTitle.trim()) return;
                  if (supabase) {
                    await supabase.from('achievements').insert({
                      title: achTitle,
                      issuer: achIssuer,
                      year: achYear,
                      description: achDesc,
                    });
                    await onRefreshData();
                  } else {
                    setLocalAchievements((prev) => [
                      ...prev,
                      {
                        id: `ach-${Date.now()}`,
                        title: achTitle,
                        issuer: achIssuer,
                        year: achYear,
                        description: achDesc,
                      },
                    ]);
                  }
                  setAchTitle('');
                  setAchIssuer('');
                  setAchDesc('');
                  notify('success', 'Achievement added.');
                }}
                className="space-y-2.5"
              >
                <input
                  type="text"
                  required
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="Award / Certificate Title"
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={achIssuer}
                  onChange={(e) => setAchIssuer(e.target.value)}
                  placeholder="Organization / Issuer"
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={achYear}
                  onChange={(e) => setAchYear(e.target.value)}
                  placeholder="Year (e.g. 2026)"
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#D4AF37] text-[#050507] text-xs font-semibold"
                >
                  + Add Achievement
                </button>
              </form>
              <div className="space-y-2 pt-2">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-lg bg-[#050507] flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{a.title}</div>
                      <div className="text-[#8E8E93]">{a.issuer} ({a.year})</div>
                    </div>
                    <button
                      onClick={async () => {
                        if (supabase) {
                          await supabase.from('achievements').delete().eq('id', a.id);
                          await onRefreshData();
                        } else {
                          setLocalAchievements((prev) => prev.filter((item) => item.id !== a.id));
                        }
                      }}
                      className="text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="luxury-card rounded-2xl p-5 space-y-4">
              <h3 className="font-display text-xl font-bold text-[#D4AF37] flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Studio Events
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!evTitle.trim()) return;
                  if (supabase) {
                    await supabase.from('events').insert({
                      title: evTitle,
                      event_date: evDate || new Date().toISOString().slice(0, 10),
                      location: evLocation || 'Studio',
                      description: evDesc,
                      status: evStatus,
                    });
                    await onRefreshData();
                  } else {
                    setLocalEvents((prev) => [
                      ...prev,
                      {
                        id: `ev-${Date.now()}`,
                        title: evTitle,
                        event_date: evDate || '2026-12-01',
                        location: evLocation || 'Studio',
                        description: evDesc,
                        cover_url: '',
                        status: evStatus,
                      },
                    ]);
                  }
                  setEvTitle('');
                  setEvLocation('');
                  setEvDesc('');
                  notify('success', 'Event saved.');
                }}
                className="space-y-2.5"
              >
                <input
                  type="text"
                  required
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  placeholder="Event Title"
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="date"
                  value={evDate}
                  onChange={(e) => setEvDate(e.target.value)}
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={evLocation}
                  onChange={(e) => setEvLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
                <select
                  value={evStatus}
                  onChange={(e) => setEvStatus(e.target.value as 'upcoming' | 'past')}
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="upcoming">Upcoming Event</option>
                  <option value="past">Past Event</option>
                </select>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#D4AF37] text-[#050507] text-xs font-semibold"
                >
                  + Add Event
                </button>
              </form>
              <div className="space-y-2 pt-2">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg bg-[#050507] flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{ev.title}</div>
                      <div className="text-[#8E8E93]">{ev.event_date} • {ev.status}</div>
                    </div>
                    <button
                      onClick={async () => {
                        if (supabase) {
                          await supabase.from('events').delete().eq('id', ev.id);
                          await onRefreshData();
                        } else {
                          setLocalEvents((prev) => prev.filter((item) => item.id !== ev.id));
                        }
                      }}
                      className="text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="luxury-card rounded-2xl p-5 space-y-4">
              <h3 className="font-display text-xl font-bold text-[#D4AF37] flex items-center gap-2">
                <Star className="w-4 h-4" /> Client Reviews
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!revName.trim() || !revText.trim()) return;
                  if (supabase) {
                    await supabase.from('reviews').insert({
                      client_name: revName,
                      service_type: revService,
                      rating: 5,
                      review_text: revText,
                    });
                    await onRefreshData();
                  } else {
                    setLocalReviews((prev) => [
                      ...prev,
                      {
                        id: `rev-${Date.now()}`,
                        client_name: revName,
                        service_type: revService,
                        rating: 5,
                        review_text: revText,
                      },
                    ]);
                  }
                  setRevName('');
                  setRevText('');
                  notify('success', 'Client review published.');
                }}
                className="space-y-2.5"
              >
                <input
                  type="text"
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="Client Name"
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={revService}
                  onChange={(e) => setRevService(e.target.value)}
                  placeholder="Service (e.g. Wedding Photography)"
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
                <textarea
                  rows={2}
                  required
                  value={revText}
                  onChange={(e) => setRevText(e.target.value)}
                  placeholder="Client feedback..."
                  className="w-full bg-[#050507] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#D4AF37] text-[#050507] text-xs font-semibold"
                >
                  + Publish Review
                </button>
              </form>
              <div className="space-y-2 pt-2">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-lg bg-[#050507] flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{rev.client_name}</div>
                      <div className="text-[#8E8E93] line-clamp-1">{rev.review_text}</div>
                    </div>
                    <button
                      onClick={async () => {
                        if (supabase) {
                          await supabase.from('reviews').delete().eq('id', rev.id);
                          await onRefreshData();
                        } else {
                          setLocalReviews((prev) => prev.filter((item) => item.id !== rev.id));
                        }
                      }}
                      className="text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
