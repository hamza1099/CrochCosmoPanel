import React, { useState } from "react";
import { Upload } from "lucide-react";
import { BannerItem, saveBannerToDB, deleteBannerFromDB } from "../firebase";
import { ConfirmModal } from "../components/ConfirmModal";
import { uploadToBunny, deleteFromBunny } from "../services/bunnyStorageService";

interface BannersPageProps {
  banners: BannerItem[];
  setBanners: React.Dispatch<React.SetStateAction<BannerItem[]>>;
}

export const BannersPage: React.FC<BannersPageProps> = ({ banners, setBanners }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setImgFn: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImgFn("Uploading...");
        const url = await uploadToBunny(file, "banners");
        setImgFn(url);
      } catch (error) {
        console.error("Banner image upload failed", error);
        alert("Failed to upload image.");
        setImgFn("");
      }
    }
  };

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("/collections");
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setBadge("Exclusive Offer");
    setImageUrl("");
    setLinkUrl("/collections");
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: BannerItem) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setBadge(b.badge);
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl);
    setActive(b.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingBanner ? editingBanner.id : `banner-${Date.now()}`;
    const updated: BannerItem = {
      id,
      title: title.trim() || "CrochCosmo Luxury",
      subtitle: subtitle.trim() || "Handcrafted with Love",
      badge: badge.trim() || "Artisanal",
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80",
      linkUrl: linkUrl.trim() || "/collections",
      active,
    };

    saveBannerToDB(updated);

    setBanners((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });

    setIsModalOpen(false);
  };

  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (bannerToDelete) {
      const banner = banners.find(b => b.id === bannerToDelete);
      if (banner && banner.imageUrl) {
        try {
          await deleteFromBunny(banner.imageUrl);
        } catch (e) {
          console.error("Failed to delete banner image from Bunny Storage:", e);
        }
      }
      await deleteBannerFromDB(bannerToDelete);
      setBanners((prev) => prev.filter((b) => b.id !== bannerToDelete));
      setBannerToDelete(null);
    }
  };

  const handleToggleActive = (b: BannerItem) => {
    const updated = { ...b, active: !b.active };
    saveBannerToDB(updated);
    setBanners((prev) => prev.map((item) => (item.id === b.id ? updated : item)));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans text-[#1b1c1a]">
      <ConfirmModal
        isOpen={!!bannerToDelete}
        title="Delete Promotional Banner"
        message="Are you sure you want to delete this promotional banner? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setBannerToDelete(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e4d31] block">
            Storefront Banners
          </span>
          <h1 className="text-2xl font-bold text-[#1b1c1a]">Hero Banner Management</h1>
          <p className="text-xs text-[#76786f]">
            Control sliding hero banners, promo text, and call-to-actions on the customer store homepage.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#8e4d31] hover:bg-[#71361d] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#e4e2de] space-y-3">
          <span className="material-symbols-outlined text-4xl text-amber-500">style</span>
          <h3 className="text-base font-bold text-gray-700">No Hero Banners Created Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">Create promotional banners to display on your storefront home page carousel.</p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-[#8e4d31] hover:bg-[#71361d] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ Add Your First Hero Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
          <div
            key={b.id}
            className={`bg-white rounded-2xl border ${b.active ? "border-[#e4e2de]" : "border-red-200 bg-red-50/20"} shadow-sm overflow-hidden flex flex-col group`}
          >
            <div className="relative h-48 bg-[#f5f3ef] overflow-hidden">
              <img
                src={b.imageUrl}
                alt={b.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#1b1c1a]/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                {b.badge}
              </div>

              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${b.active ? "bg-emerald-600 text-white" : "bg-gray-400 text-white"}`}
                >
                  {b.active ? "Active" : "Disabled"}
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-lg text-[#1b1c1a]">{b.title}</h3>
                <p className="text-xs text-[#76786f] mt-1">{b.subtitle}</p>
                <p className="text-[11px] font-mono text-[#8e4d31] mt-2">Target Link: {b.linkUrl}</p>
              </div>

              <div className="pt-3 border-t border-[#f5f3ef] flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(b)}
                  className="px-3.5 py-1.5 bg-[#f5f3ef] hover:bg-[#eae8e4] text-[#1b1c1a] rounded-lg text-xs font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => setBannerToDelete(b.id)}
                  className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-[#e4e2de] shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#f5f3ef]">
              <h3 className="font-bold text-lg text-[#1b1c1a]">
                {editingBanner ? "Edit Hero Banner" : "Add New Hero Banner"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f5f3ef] text-[#76786f] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#585e4c] mb-1 uppercase">Banner Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EXCLUSIVE CROCHET COLLECTION"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-[#c7c7bd] rounded-xl bg-[#fbf9f5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#585e4c] mb-1 uppercase">Subtitle / Offer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPECIAL 40% OFFER"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full p-2.5 border border-[#c7c7bd] rounded-xl bg-[#fbf9f5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#585e4c] mb-1 uppercase">Badge Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HANDMADE MERINO"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full p-2.5 border border-[#c7c7bd] rounded-xl bg-[#fbf9f5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#585e4c] mb-1 uppercase">Banner Image (Upload Photo or Paste Link)</label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-2">
                  <label className="px-4 py-2 bg-[#8e4d31] hover:bg-[#723c24] text-white text-xs font-bold uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap">
                    <Upload size={14} /> Upload Local Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setImageUrl)}
                    />
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://... or uploaded image data"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-grow p-2.5 border border-[#c7c7bd] rounded-xl bg-[#fbf9f5] font-mono text-[11px]"
                  />
                </div>
                {imageUrl && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-2">
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#585e4c] mb-1 uppercase">Target Collection Link</label>
                <input
                  type="text"
                  required
                  placeholder="/collections"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-2.5 border border-[#c7c7bd] rounded-xl bg-[#fbf9f5]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-[#8e4d31]"
                />
                <label htmlFor="activeCheck" className="font-bold text-[#1b1c1a]">
                  Show on Customer Website (Active)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#f5f3ef]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#f5f3ef] text-[#1b1c1a] rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8e4d31] text-white rounded-xl font-bold shadow-md"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
