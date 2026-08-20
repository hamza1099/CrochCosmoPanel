import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, Eye, Image as ImageIcon, Plus, Trash2, ChevronLeft, ChevronRight, Layers, Users, Upload, Loader2 } from "lucide-react";
import { BannerItem, saveBannerToDB, deleteBannerFromDB, uploadImageToFirebaseStorage } from "../firebase";
import { ConfirmModal } from "../components/ConfirmModal";

interface HeroBannerItem {
  id: string;
  imageUrl: string;
  title: string;
  linkUrl: string;
  active: boolean;
}

interface AssetsPageProps {
  banners?: BannerItem[];
  setBanners?: React.Dispatch<React.SetStateAction<BannerItem[]>>;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
}

export const AssetsPage: React.FC<AssetsPageProps> = ({ banners, setBanners, exchangeRate, setExchangeRate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processImageFile = async (file: File): Promise<string> => {
    // 1. Try Firebase Cloud Storage first
    try {
      const url = await uploadImageToFirebaseStorage(file, "banners");
      if (url) return url;
    } catch (e) {
      console.warn("Storage upload failed, falling back to compressed Canvas JPEG:", e);
    }

    // 2. Fallback to Canvas JPEG compression (max 1000px width -> ~80KB to fit inside Firestore 1MB limit)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1000;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          } else {
            resolve(evt.target?.result as string);
          }
        };
        img.onerror = () => resolve(evt.target?.result as string);
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setImgFn: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      // Defer network upload: Store local File object and generate instant local preview DataURL
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImgFn(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [activeTab, setActiveTab] = useState<"hero" | "category_banners" | "settings">("hero");

  // Hero Slider Banners Array (Pure dynamic state initialized empty, no hardcoded dummy data)
  const [heroSlides, setHeroSlides] = useState<HeroBannerItem[]>([]);
  const [currentPreviewSlide, setCurrentPreviewSlide] = useState<number>(0);

  // Sync real-time Firestore banners whenever available
  useEffect(() => {
    if (banners !== undefined) {
      setHeroSlides(
        banners.map((b) => ({
          id: b.id,
          imageUrl: b.imageUrl,
          title: b.title || "CrochCosmo Luxury Banner",
          linkUrl: b.linkUrl || "/collections",
          active: b.active !== false
        }))
      );
    }
  }, [banners]);

  // New Hero Slide State
  const [newSlideUrl, setNewSlideUrl] = useState("");
  const [newSlideTitle, setNewSlideTitle] = useState("");

  // Category Banners State (Women, Men, Baby)
  const [womenBannerUrl, setWomenBannerUrl] = useState("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=80");
  const [womenBannerTagline, setWomenBannerTagline] = useState("Exclusive Women's Line • Handcrafted Cardigans, Sweaters & Apparel");

  const [menBannerUrl, setMenBannerUrl] = useState("https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1400&q=80");
  const [menBannerTagline, setMenBannerTagline] = useState("Exclusive Men's Line • Vintage Crochet Overshirts & Heavy Knits");

  const [babyBannerUrl, setBabyBannerUrl] = useState("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80");
  const [babyBannerTagline, setBabyBannerTagline] = useState("Exclusive Baby & Kids Line • Gentle Organic Cotton & Soft Wool Sets");

  // Category Preview Active Tab
  const [previewCategoryTab, setPreviewCategoryTab] = useState<"women" | "men" | "baby">("women");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideUrl && !selectedFile) return;

    setIsSubmitting(true);
    try {
      let finalImageUrl = newSlideUrl;
      if (selectedFile) {
        finalImageUrl = await processImageFile(selectedFile);
      }

      const bannerId = `banner-${Date.now()}`;
      const newSlide: HeroBannerItem = {
        id: bannerId,
        imageUrl: finalImageUrl,
        title: newSlideTitle || `Banner Slide #${heroSlides.length + 1}`,
        linkUrl: "/collections",
        active: true
      };

      const newBannerItem: BannerItem = {
        id: bannerId,
        title: newSlide.title,
        subtitle: "Handcrafted Luxury",
        badge: "Featured",
        imageUrl: newSlide.imageUrl,
        linkUrl: newSlide.linkUrl,
        active: true
      };

      setHeroSlides((prev) => [...prev, newSlide]);
      setNewSlideUrl("");
      setNewSlideTitle("");
      setSelectedFile(null);

      if (setBanners) {
        setBanners((prev) => [...prev.filter((b) => b.id !== bannerId), newBannerItem]);
      }
      await saveBannerToDB(newBannerItem);
    } catch (err) {
      console.error("Error adding banner slide:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (slideToDelete) {
      setHeroSlides((prev) => prev.filter((s) => s.id !== slideToDelete));
      setCurrentPreviewSlide(0);

      if (setBanners) {
        setBanners((prev) => prev.filter((s) => s.id !== slideToDelete));
      }
      await deleteBannerFromDB(slideToDelete);
      setSlideToDelete(null);
    }
  };

  const toggleSlideActive = async (id: string) => {
    const updated = heroSlides.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setHeroSlides(updated);

    const target = updated.find((s) => s.id === id);
    if (target) {
      const bannerItem: BannerItem = {
        id: target.id,
        title: target.title,
        subtitle: "Handcrafted Luxury",
        badge: "Featured",
        imageUrl: target.imageUrl,
        linkUrl: target.linkUrl,
        active: target.active
      };

      if (setBanners) {
        setBanners((prev) => prev.map((b) => (b.id === id ? bannerItem : b)));
      }
      await saveBannerToDB(bannerItem);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Persist all current slides into Firestore collection
    for (const slide of heroSlides) {
      await saveBannerToDB({
        id: slide.id,
        title: slide.title,
        subtitle: "Handcrafted Luxury",
        badge: "Featured",
        imageUrl: slide.imageUrl,
        linkUrl: slide.linkUrl,
        active: slide.active
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const activeSlides = heroSlides.filter((s) => s.active);
  const activeSlideIndex = Math.min(currentPreviewSlide, Math.max(0, activeSlides.length - 1));

  const activeCategoryBanner =
    previewCategoryTab === "women"
      ? womenBannerUrl
      : previewCategoryTab === "men"
      ? menBannerUrl
      : babyBannerUrl;

  const activeCategoryTagline =
    previewCategoryTab === "women"
      ? womenBannerTagline
      : previewCategoryTab === "men"
      ? menBannerTagline
      : babyBannerTagline;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <ConfirmModal
        isOpen={!!slideToDelete}
        title="Delete Banner Slide"
        message="Are you sure you want to delete this hero banner slide? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setSlideToDelete(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8e4d31]">
            Storefront Visual Banner Manager
          </span>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1b1c1a]">
            Banners & Category Media Manager
          </h1>
        </div>
        {savedSuccess && (
          <span className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-bounce">
            <CheckCircle2 size={16} /> All Banners Saved & Published Live!
          </span>
        )}
      </div>

      {/* Banner Tabs (Middle Promo Removed) */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#e4e2de] overflow-x-auto">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "hero"
              ? "bg-[#8e4d31] text-white shadow-sm"
              : "text-gray-600 hover:text-black hover:bg-gray-100"
          }`}
        >
          <ImageIcon size={15} /> 1. Hero Image Slider ({heroSlides.length} Banners)
        </button>

        <button
          onClick={() => setActiveTab("category_banners")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "category_banners"
              ? "bg-[#8e4d31] text-white shadow-sm"
              : "text-gray-600 hover:text-black hover:bg-gray-100"
          }`}
        >
          <Users size={15} /> 2. Category Banners (Women, Men & Baby)
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-[#8e4d31] text-white shadow-sm"
              : "text-gray-600 hover:text-black hover:bg-gray-100"
          }`}
        >
          <Layers size={15} /> 3. Currency Rate (PKR)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#e4e2de] p-5 sm:p-6 shadow-xs space-y-6">
            
            {/* TAB 1: HERO IMAGE BANNER SLIDER */}
            {activeTab === "hero" && (
              <div className="space-y-5 text-xs">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-serif-title text-xl font-bold text-[#1b1c1a]">Hero Banner Slider Images</h3>
                  <p className="text-[11px] text-gray-500">Manage pure image banners shown in the homepage main carousel slider.</p>
                </div>

                {/* List of current slider banners */}
                <div className="space-y-3">
                  <span className="font-bold text-gray-600 uppercase text-[10px] block">Active Slider Images</span>
                  {heroSlides.length === 0 ? (
                    <div className="p-5 bg-[#f8f7f4] rounded-xl border border-dashed border-[#c7c7bd] text-center text-gray-500 text-xs">
                      No active hero slider banners found in Database. Upload a photo below to add your first banner.
                    </div>
                  ) : (
                    heroSlides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        className="p-3 bg-[#f8f7f4] rounded-xl border border-[#e4e2de] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={slide.imageUrl}
                            alt={slide.title}
                            className="w-16 h-10 object-cover rounded-lg border border-gray-200 bg-gray-100 flex-shrink-0"
                          />
                          <div className="overflow-hidden">
                            <span className="font-bold text-[#1b1c1a] block truncate text-xs">
                              Banner #{idx + 1}: {slide.title || "Untitled Banner"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono block truncate">
                              {slide.imageUrl}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleSlideActive(slide.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                              slide.active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {slide.active ? "Active" : "Hidden"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSlideToDelete(slide.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Banner"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new slide image */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <span className="font-bold text-[#8e4d31] uppercase text-xs block flex items-center gap-1">
                    <Plus size={14} /> Add New Hero Banner Image
                  </span>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1 uppercase">Banner Image (Upload Photo or Paste Link)</label>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-2">
                      <label className="px-4 py-2.5 bg-[#8e4d31] hover:bg-[#723c24] text-white text-xs font-bold uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap">
                        <Upload size={15} /> Select Photo File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setNewSlideUrl)}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste URL (https://...)"
                        value={newSlideUrl}
                        onChange={(e) => {
                          setNewSlideUrl(e.target.value);
                          setSelectedFile(null);
                        }}
                        className="flex-grow p-2.5 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] font-mono text-[11px]"
                      />
                    </div>
                    {newSlideUrl && (
                      <div className="relative w-full h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-2">
                        <img src={newSlideUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1 uppercase">Banner Label / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Men's Crochet Summer Collection"
                      value={newSlideTitle}
                      onChange={(e) => setNewSlideTitle(e.target.value)}
                      className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSlide}
                    disabled={!newSlideUrl || isSubmitting}
                    className="w-full py-2.5 bg-[#585e4c] hover:bg-[#717763] disabled:opacity-50 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    {isSubmitting ? "Uploading & Publishing Banner..." : "+ Add Banner To Carousel"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CATEGORY BANNERS (WOMEN, MEN & BABY WEAR) */}
            {activeTab === "category_banners" && (
              <div className="space-y-6 text-xs">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-serif-title text-xl font-bold text-[#1b1c1a]">Artisanal Fashion Category Banners</h3>
                  <p className="text-[11px] text-gray-500">Configure background banner images for Women's Wear, Men's Wear, and Baby Wear sections.</p>
                </div>

                {/* 1. Women's Wear Banner */}
                <div className="p-4 bg-[#f8f7f4] rounded-2xl border border-[#e4e2de] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8e4d31] uppercase text-xs">1. Women's Wear Banner</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">Women Tab</span>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1 uppercase text-[10px]">Women Banner Image</label>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      <label className="px-3 py-2 bg-[#8e4d31] hover:bg-[#723c24] text-white text-[11px] font-bold uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-xs whitespace-nowrap">
                        <Upload size={13} /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setWomenBannerUrl)}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste URL..."
                        value={womenBannerUrl}
                        onChange={(e) => setWomenBannerUrl(e.target.value)}
                        className="flex-grow p-2.5 bg-white border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] font-mono text-[11px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1 uppercase text-[10px]">Tagline Text</label>
                    <input
                      type="text"
                      value={womenBannerTagline}
                      onChange={(e) => setWomenBannerTagline(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                    />
                  </div>
                </div>

                {/* 2. Men's Wear Banner */}
                <div className="p-4 bg-[#f8f7f4] rounded-2xl border border-[#e4e2de] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8e4d31] uppercase text-xs">2. Men's Wear Banner</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Men Tab</span>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1 uppercase text-[10px]">Men Banner Image</label>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      <label className="px-3 py-2 bg-[#8e4d31] hover:bg-[#723c24] text-white text-[11px] font-bold uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-xs whitespace-nowrap">
                        <Upload size={13} /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setMenBannerUrl)}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste URL..."
                        value={menBannerUrl}
                        onChange={(e) => setMenBannerUrl(e.target.value)}
                        className="flex-grow p-2.5 bg-white border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] font-mono text-[11px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1 uppercase text-[10px]">Tagline Text</label>
                    <input
                      type="text"
                      value={menBannerTagline}
                      onChange={(e) => setMenBannerTagline(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                    />
                  </div>
                </div>

                {/* 3. Baby Wear Banner */}
                <div className="p-4 bg-[#f8f7f4] rounded-2xl border border-[#e4e2de] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8e4d31] uppercase text-xs">3. Baby Wear Banner</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">Baby Tab</span>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1 uppercase text-[10px]">Baby Banner Image</label>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      <label className="px-3 py-2 bg-[#8e4d31] hover:bg-[#723c24] text-white text-[11px] font-bold uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-xs whitespace-nowrap">
                        <Upload size={13} /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setBabyBannerUrl)}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste URL..."
                        value={babyBannerUrl}
                        onChange={(e) => setBabyBannerUrl(e.target.value)}
                        className="flex-grow p-2.5 bg-white border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] font-mono text-[11px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1 uppercase text-[10px]">Tagline Text</label>
                    <input
                      type="text"
                      value={babyBannerTagline}
                      onChange={(e) => setBabyBannerTagline(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SYSTEM SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-serif-title text-xl font-bold text-[#1b1c1a]">Currency & Exchange Rate Settings</h3>
                  <p className="text-[11px] text-gray-500">Live USD to PKR currency multiplier used across the store.</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1 uppercase">Live PKR Currency Rate (1 USD = ? PKR)</label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full sm:w-48 p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl font-bold text-lg text-[#8e4d31] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#8e4d31] hover:bg-[#723c24] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save size={16} /> Save & Publish Storefront Banners
              </button>
            </div>
          </form>
        </div>

        {/* Live Mockup Column: Shows exact preview of selected banner type */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-[#e4e2de] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8e4d31]">
                <Eye size={16} /> {activeTab === "category_banners" ? "Category Fashion Banner Mockup" : "Storefront Banner Mockup"}
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-md">
                Live Store Replica
              </span>
            </div>

            {/* MOCKUP 1: CATEGORY BANNERS MOCKUP (WHEN CATEGORY TAB IS ACTIVE) */}
            {activeTab === "category_banners" ? (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#8e4d31]">Slow Fashion Heritage</span>
                  <h3 className="font-serif-title text-xl font-bold text-[#1b1c1a]">Artisanal Fashion Banners</h3>
                </div>

                {/* 3 Tab Selector inside Mockup */}
                <div className="flex items-center justify-center gap-1.5 p-1 bg-[#eae8e4] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewCategoryTab("women")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      previewCategoryTab === "women" ? "bg-[#8e4d31] text-white shadow-xs" : "text-gray-600"
                    }`}
                  >
                    Women's Wear
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewCategoryTab("men")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      previewCategoryTab === "men" ? "bg-[#8e4d31] text-white shadow-xs" : "text-gray-600"
                    }`}
                  >
                    Men's Wear
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewCategoryTab("baby")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      previewCategoryTab === "baby" ? "bg-[#8e4d31] text-white shadow-xs" : "text-gray-600"
                    }`}
                  >
                    Baby Wear
                  </button>
                </div>

                {/* Category Banner Display with Fixed Standardized Height */}
                <div className="relative rounded-2xl overflow-hidden shadow-md bg-black border border-gray-200">
                  <img
                    src={activeCategoryBanner}
                    alt="Active Category Banner"
                    className="w-full h-52 object-cover object-center block"
                  />
                  <div className="bg-[#1b1c1a] p-3 text-white flex items-center justify-between text-xs">
                    <span className="truncate pr-2 font-medium">{activeCategoryTagline}</span>
                    <span className="px-3 py-1 bg-[#8e4d31] rounded-lg text-[10px] font-bold uppercase flex-shrink-0">
                      Shop {previewCategoryTab.toUpperCase()} →
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* MOCKUP 2: HERO SLIDER MOCKUP */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden min-h-[280px] shadow-md bg-gray-900">
                  {activeSlides.length > 0 ? (
                    <>
                      <img
                        src={activeSlides[activeSlideIndex]?.imageUrl}
                        alt={activeSlides[activeSlideIndex]?.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
                        }}
                        className="w-full h-full min-h-[280px] object-cover transition-all duration-500"
                      />

                      <button
                        onClick={() =>
                          setCurrentPreviewSlide((prev) =>
                            prev === 0 ? activeSlides.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-all z-20 backdrop-blur-xs"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        onClick={() =>
                          setCurrentPreviewSlide((prev) =>
                            prev === activeSlides.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-all z-20 backdrop-blur-xs"
                      >
                        <ChevronRight size={18} />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full">
                        {activeSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentPreviewSlide(idx)}
                            className={`h-2 rounded-full transition-all ${
                              activeSlideIndex === idx ? "w-6 bg-white" : "w-2 bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center text-gray-400 text-xs">
                      No active hero slides.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-center pt-2 text-[10px] text-gray-400 font-medium">
              💡 Live Preview dynamically syncs with storefront category & hero banner components.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
