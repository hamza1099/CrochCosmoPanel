import React, { useState } from "react";
import { Upload } from "lucide-react";
import { PopularCategoryItem, savePopularCategoryToDB, deletePopularCategoryFromDB } from "../firebase";
import { ConfirmModal } from "../components/ConfirmModal";
import { uploadToBunny, deleteFromBunny } from "../services/bunnyStorageService";

interface PopularCategoriesPageProps {
  popularCategories: PopularCategoryItem[];
  setPopularCategories: React.Dispatch<React.SetStateAction<PopularCategoryItem[]>>;
}

export const PopularCategoriesPage: React.FC<PopularCategoriesPageProps> = ({ popularCategories, setPopularCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PopularCategoryItem | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setImgFn: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImgFn("Uploading...");
        const url = await uploadToBunny(file, "popular-categories");
        setImgFn(url);
      } catch (error) {
        console.error("Image upload failed", error);
        alert("Failed to upload image.");
        setImgFn("");
      }
    }
  };

  const [title, setTitle] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingCategory(null);
    setTitle("");
    setCategoryName("");
    setImageUrl("");
    setOrder(popularCategories.length);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: PopularCategoryItem) => {
    setEditingCategory(c);
    setTitle(c.title);
    setCategoryName(c.categoryName);
    setImageUrl(c.imageUrl);
    setOrder(c.order || 0);
    setActive(c.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingCategory ? editingCategory.id : `popcat-${Date.now()}`;
    const updated: PopularCategoryItem = {
      id,
      title: title.trim() || "New Category",
      categoryName: categoryName.trim() || "Uncategorized",
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
      order,
      active,
    };

    savePopularCategoryToDB(updated);

    setPopularCategories((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev].sort((a, b) => a.order - b.order);
    });

    setIsModalOpen(false);
  };

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (categoryToDelete) {
      const cat = popularCategories.find(c => c.id === categoryToDelete);
      if (cat && cat.imageUrl) {
        try {
          await deleteFromBunny(cat.imageUrl);
        } catch (e) {
          console.error("Failed to delete category image from Bunny Storage:", e);
        }
      }
      await deletePopularCategoryFromDB(categoryToDelete);
      setPopularCategories((prev) => prev.filter((c) => c.id !== categoryToDelete));
      setCategoryToDelete(null);
    }
  };

  const handleToggleActive = (c: PopularCategoryItem) => {
    const updated = { ...c, active: !c.active };
    savePopularCategoryToDB(updated);
    setPopularCategories((prev) => prev.map((item) => (item.id === c.id ? updated : item)));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans text-[#1b1c1a]">
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Delete Popular Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e4d31] block">
            Storefront Categories
          </span>
          <h1 className="text-2xl font-bold text-[#1b1c1a]">Popular Categories</h1>
          <p className="text-xs text-[#76786f]">
            Control which 4 categories are featured on the storefront homepage.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#8e4d31] hover:bg-[#71361d] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add Category</span>
        </button>
      </div>

      {popularCategories.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#e4e2de] space-y-3">
          <span className="material-symbols-outlined text-4xl text-amber-500">category</span>
          <h3 className="text-base font-bold text-gray-700">No Popular Categories Created Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">Create featured categories to display on your storefront home page.</p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-[#8e4d31] hover:bg-[#71361d] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ Add Your First Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {popularCategories.slice().sort((a,b) => a.order - b.order).map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-2xl border ${c.active ? "border-[#e4e2de]" : "border-red-200 bg-red-50/20"} shadow-sm overflow-hidden flex flex-col group`}
          >
            <div className="relative aspect-[4/5] bg-[#f5f3ef] overflow-hidden">
              <img
                src={c.imageUrl}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => handleToggleActive(c)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${c.active ? "bg-emerald-600 text-white" : "bg-gray-400 text-white"}`}
                >
                  {c.active ? "Active" : "Disabled"}
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4 text-center">
              <div>
                <h3 className="font-display font-bold text-lg text-[#1b1c1a]">{c.title}</h3>
                <p className="text-xs text-[#76786f] mt-1">Links to: {c.categoryName}</p>
                <p className="text-[10px] font-mono text-[#8e4d31] mt-1">Order: {c.order}</p>
              </div>

              <div className="pt-3 border-t border-[#f5f3ef] flex justify-center gap-2">
                <button
                  onClick={() => openEditModal(c)}
                  className="px-3.5 py-1.5 bg-[#f5f3ef] hover:bg-[#eae8e4] text-[#1b1c1a] rounded-lg text-xs font-bold w-full"
                >
                  Edit
                </button>
                <button
                  onClick={() => setCategoryToDelete(c.id)}
                  className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold w-full"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-[#e4e2de] shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#f5f3ef]">
              <h3 className="font-bold text-lg text-[#1b1c1a]">
                {editingCategory ? "Edit Popular Category" : "Add New Category"}
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
                <label className="block font-bold text-[#585e4c] mb-1 uppercase">Display Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bag Charms"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-[#c7c7bd] rounded-xl bg-[#fbf9f5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#585e4c] mb-1 uppercase">Target Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gifts & Home"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-2.5 border border-[#c7c7bd] rounded-xl bg-[#fbf9f5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#585e4c] mb-1 uppercase">Category Image</label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-2">
                  <label className="px-4 py-2 bg-[#8e4d31] hover:bg-[#723c24] text-white text-xs font-bold uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap">
                    <Upload size={14} /> Upload Image
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
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-grow p-2.5 border border-[#c7c7bd] rounded-xl bg-[#fbf9f5] font-mono text-[11px]"
                  />
                </div>
                {imageUrl && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-2">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#585e4c] mb-1 uppercase">Display Order</label>
                <input
                  type="number"
                  required
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
