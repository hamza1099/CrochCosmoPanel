import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Search, Upload, Eye, Check, Sparkles, Layers, ShoppingBag } from "lucide-react";
import { ProductItem, saveProductToDB, deleteProductFromDB } from "../firebase";
import { ConfirmModal } from "../components/ConfirmModal";
import { uploadToBunny, deleteFromBunny } from "../services/bunnyStorageService";

interface ProductsPageProps {
  products: ProductItem[];
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  exchangeRate: number;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ products, setProducts, exchangeRate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Form State for Adding / Editing Product
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Baby Apparel");
  const [formYarnType, setFormYarnType] = useState("Organic Wool");
  const [formPrice, setFormPrice] = useState<number | string>(55.00);
  const [formBadge, setFormBadge] = useState("ORGANIC WOOL");
  const [formStock, setFormStock] = useState<number | string>(15);
  const [formDescription, setFormDescription] = useState(
    "Handcrafted with love by our collective of women artisans. Made from 100% locally sourced organic wool, this sweater is incredibly soft, breathable, and designed to gently embrace your little one."
  );
  const [formColorsStr, setFormColorsStr] = useState("Beige, Oatmeal, Sage");
  const [formSizesStr, setFormSizesStr] = useState("0-3M, 3-6M, 6-12M");
  const [formPersonalization, setFormPersonalization] = useState(true);

  // 3 Images state
  const [img1, setImg1] = useState("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80");
  const [img2, setImg2] = useState("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80");
  const [img3, setImg3] = useState("https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80");

  // Preview Image active tab for modal
  const [selectedPreviewImg, setSelectedPreviewImg] = useState<string>("");

  const resetForm = () => {
    setFormName("");
    setFormCategory("Baby Apparel");
    setFormYarnType("Organic Wool");
    setFormPrice(55.00);
    setFormBadge("ORGANIC WOOL");
    setFormStock(15);
    setFormDescription(
      "Handcrafted with love by our collective of women artisans. Made from 100% locally sourced organic wool, this sweater is incredibly soft, breathable, and designed to gently embrace your little one."
    );
    setFormColorsStr("");
    setFormSizesStr("");
    setFormPersonalization(true);
    setImg1("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80");
    setImg2("");
    setImg3("");
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormYarnType(prod.yarnType);
    setFormPrice(prod.priceUSD);
    setFormBadge(prod.badge || "Handmade");
    setFormStock(prod.stockQuantity);
    setFormDescription(prod.description || "");
    setFormColorsStr(prod.colors ? prod.colors.join(", ") : "");
    setFormSizesStr(prod.sizes ? prod.sizes.join(", ") : "");
    setFormPersonalization(prod.allowPersonalization ?? true);

    const imgs = prod.images && prod.images.length > 0 ? prod.images : [prod.imageUrl];
    setImg1(imgs[0] || "");
    setImg2(imgs[1] || "");
    setImg3(imgs[2] || "");
  };

  // Upload File to Bunny CDN
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setImgFn: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImgFn("Uploading..."); // Temporary state if you want, but simple UX for now
        const url = await uploadToBunny(file, "products");
        setImgFn(url);
      } catch (error) {
        console.error("Image upload failed", error);
        alert("Failed to upload image.");
        setImgFn(""); // Reset on fail
      }
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    const gallery = [img1, img2, img3].filter(Boolean);

    const newItem: ProductItem = {
      id: `prod-${Date.now()}`,
      name: formName,
      category: formCategory,
      yarnType: formYarnType,
      priceUSD: Number(formPrice),
      rating: 5.0,
      badge: formBadge || "Handcrafted",
      imageUrl: img1 || gallery[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
      images: gallery.length > 0 ? gallery : [img1],
      description: formDescription,
      colors: formColorsStr.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: formSizesStr.split(",").map((s) => s.trim()).filter(Boolean),
      allowPersonalization: formPersonalization,
      stockQuantity: Number(formStock) || 1,
      inStock: true
    };

    setProducts((prev) => [newItem, ...prev]);
    await saveProductToDB(newItem);
    setShowAddModal(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const gallery = [img1, img2, img3].filter(Boolean);

    const updatedItem: ProductItem = {
      ...editingProduct,
      name: formName,
      category: formCategory,
      yarnType: formYarnType,
      priceUSD: Number(formPrice),
      badge: formBadge || "Handcrafted",
      stockQuantity: Number(formStock) || 0,
      description: formDescription,
      imageUrl: img1 || gallery[0] || editingProduct.imageUrl,
      images: gallery.length > 0 ? gallery : [editingProduct.imageUrl],
      colors: formColorsStr.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: formSizesStr.split(",").map((s) => s.trim()).filter(Boolean),
      allowPersonalization: formPersonalization
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? updatedItem : p))
    );
    await saveProductToDB(updatedItem);
    setEditingProduct(null);
  };

  const toggleStock = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const updatedProduct = { ...product, inStock: !product.inStock };
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      await saveProductToDB(updatedProduct);
    }
  };

  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (productToDelete) {
      const product = products.find(p => p.id === productToDelete);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete));
      
      if (product) {
        try {
          const galleryImgs = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
          for (const img of galleryImgs) {
            if (img) await deleteFromBunny(img);
          }
        } catch (e) {
          console.error("Failed to delete product images from Bunny Storage:", e);
        }
      }
      
      await deleteProductFromDB(productToDelete);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.yarnType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product from the catalog? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8e4d31]">
            Product Catalog & Gallery Manager
          </span>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1b1c1a]">
            Handcrafted Products & Multi-Image Gallery
          </h1>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-[#8e4d31] hover:bg-[#723c24] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e4e2de]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product name or yarn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl text-xs w-full sm:w-60 focus:outline-none focus:border-[#8e4d31]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl px-3 py-2 text-xs text-[#1b1c1a] focus:outline-none font-semibold"
          >
            <option value="All">All Categories</option>
            <option value="Baby Apparel">Baby Apparel</option>
            <option value="Women's Fashion">Women's Fashion</option>
            <option value="Men's Fashion">Men's Fashion</option>
            <option value="Amigurumi">Amigurumi</option>
            <option value="Gifts & Home">Gifts & Home</option>
          </select>
        </div>

        <span className="text-xs text-gray-500 self-center">
          Total Products: <strong className="text-[#1b1c1a] font-bold">{filteredProducts.length}</strong>
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#e4e2de] shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[850px]">
          <thead className="bg-[#f8f7f4] border-b border-[#e4e2de] text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">3 Product Pictures</th>
              <th className="p-4">Product Info & Badge</th>
              <th className="p-4">Category & Material</th>
              <th className="p-4">Price (USD / PKR)</th>
              <th className="p-4">Colors & Sizes</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1efeb]">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  <ShoppingBag className="mx-auto mb-3 text-gray-300" size={40} />
                  <p className="font-bold text-gray-600 text-base">No products in catalog yet</p>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-4">Click the button below to add your first handcrafted product with photos and inventory.</p>
                  <button
                    onClick={openAddModal}
                    className="px-5 py-2.5 bg-[#8e4d31] hover:bg-[#723c24] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <Plus size={16} /> + Add Your First Product
                  </button>
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => {
              const galleryImgs = prod.images && prod.images.length > 0 ? prod.images : [prod.imageUrl];
              return (
                <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* 2-3 Pictures Column */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {galleryImgs.slice(0, 3).map((imgUrl, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={imgUrl}
                            alt={`${prod.name} Pic ${i + 1}`}
                            className={`w-11 h-13 object-cover rounded-lg border ${
                              i === 0 ? "border-[#8e4d31] shadow-xs" : "border-gray-200"
                            } bg-gray-100`}
                          />
                          <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] font-bold px-1 rounded-tl">
                            #{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Product Info & Badge */}
                  <td className="p-4 max-w-xs">
                    <h4 className="font-bold text-[#1b1c1a] text-sm leading-snug">{prod.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-amber-50 text-[#8e4d31] rounded text-[9px] font-bold border border-amber-200 uppercase">
                        {prod.badge}
                      </span>
                      {prod.allowPersonalization && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[9px] font-bold border border-purple-200">
                          ✨ Custom Name
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category & Yarn */}
                  <td className="p-4">
                    <span className="font-bold text-[#1b1c1a] block">{prod.category}</span>
                    <span className="text-gray-500 text-[11px]">{prod.yarnType}</span>
                  </td>

                  {/* Price */}
                  <td className="p-4">
                    <span className="font-serif-title font-bold text-base text-[#8e4d31] block">
                      ${prod.priceUSD.toFixed(2)}
                    </span>
                    <span className="text-gray-400 text-[10px] block font-mono">
                      Rs. {Math.round(prod.priceUSD * exchangeRate).toLocaleString()}
                    </span>
                  </td>

                  {/* Colors & Sizes */}
                  <td className="p-4 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {prod.colors?.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-medium rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {prod.sizes?.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-[#f4f2ec] text-[#8e4d31] text-[9px] font-bold rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="p-4">
                    <button
                      onClick={() => toggleStock(prod.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        prod.inStock
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {prod.inStock ? `${prod.stockQuantity} in Stock` : "Out of Stock"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setPreviewProduct(prod);
                          setSelectedPreviewImg(prod.images?.[0] || prod.imageUrl);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview Product Detail View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2 text-gray-600 hover:text-[#8e4d31] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setProductToDelete(prod.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT PRODUCT MODAL WITH 2-3 PICTURES & FILE UPLOADER */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-[#e4e2de] max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e4d31]">
                  {showAddModal ? "Create Handcrafted Listing" : "Update Existing Item"}
                </span>
                <h3 className="font-serif-title text-2xl font-bold text-[#1b1c1a]">
                  {showAddModal ? "Add New Product" : "Edit Product Details"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-black p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleSaveAdd : handleSaveEdit} className="space-y-5 text-xs">
              
              {/* SECTION: PRODUCT PICTURES (FILE UPLOAD & URL) */}
              <div className="p-4 bg-[#f8f7f4] rounded-2xl border border-[#e4e2de] space-y-4">
                <span className="font-bold text-[#8e4d31] uppercase text-xs block flex items-center gap-1.5">
                  <Layers size={15} /> Product Gallery Pictures
                </span>
                <p className="text-[11px] text-gray-500">
                  Upload image files directly from your computer or paste image links. Pic 1 acts as the main hero photo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Picture 1 (Main Hero) */}
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-700 block text-[10px] uppercase">Pic 1 (Main Cover) *</span>
                    {img1 ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-300">
                        <img src={img1} alt="Pic 1" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImg1("")}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-2 text-center text-gray-400">
                        <Upload size={20} className="mb-1 text-gray-400" />
                        <span className="text-[9px]">Select Photo</span>
                      </div>
                    )}
                    <label className="block w-full text-center py-1.5 bg-[#8e4d31] hover:bg-[#723c24] text-white rounded-lg cursor-pointer font-bold text-[10px]">
                      📁 Upload Photo 1
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setImg1)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste URL 1..."
                      value={img1}
                      onChange={(e) => setImg1(e.target.value)}
                      className="w-full p-2 bg-[#f8f7f4] border border-gray-300 rounded-lg font-mono text-[10px]"
                    />
                  </div>

                  {/* Picture 2 */}
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-700 block text-[10px] uppercase">Pic 2 (Angle 2)</span>
                    {img2 ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-300">
                        <img src={img2} alt="Pic 2" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImg2("")}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-2 text-center text-gray-400">
                        <Upload size={20} className="mb-1 text-gray-400" />
                        <span className="text-[9px]">Select Photo</span>
                      </div>
                    )}
                    <label className="block w-full text-center py-1.5 bg-[#585e4c] hover:bg-[#717763] text-white rounded-lg cursor-pointer font-bold text-[10px]">
                      📁 Upload Photo 2
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setImg2)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste URL 2..."
                      value={img2}
                      onChange={(e) => setImg2(e.target.value)}
                      className="w-full p-2 bg-[#f8f7f4] border border-gray-300 rounded-lg font-mono text-[10px]"
                    />
                  </div>

                  {/* Picture 3 */}
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-700 block text-[10px] uppercase">Pic 3 (Detail Close-up)</span>
                    {img3 ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-300">
                        <img src={img3} alt="Pic 3" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImg3("")}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-2 text-center text-gray-400">
                        <Upload size={20} className="mb-1 text-gray-400" />
                        <span className="text-[9px]">Select Photo</span>
                      </div>
                    )}
                    <label className="block w-full text-center py-1.5 bg-[#585e4c] hover:bg-[#717763] text-white rounded-lg cursor-pointer font-bold text-[10px]">
                      📁 Upload Photo 3
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setImg3)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste URL 3..."
                      value={img3}
                      onChange={(e) => setImg3(e.target.value)}
                      className="w-full p-2 bg-[#f8f7f4] border border-gray-300 rounded-lg font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {/* PRODUCT NAME & BADGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-600 mb-1 uppercase">Product Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Artisanal Organic Baby Sweater"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] font-semibold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-600 mb-1 uppercase">Badge Label Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. ORGANIC WOOL / Best Seller"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                  />
                </div>
              </div>

              {/* CATEGORY & YARN MATERIAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-600 mb-1 uppercase">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none font-medium"
                  >
                    <option value="Baby Apparel">Baby Apparel</option>
                    <option value="Women's Fashion">Women's Fashion</option>
                    <option value="Men's Fashion">Men's Fashion</option>
                    <option value="Amigurumi">Amigurumi</option>
                    <option value="Gifts & Home">Gifts & Home</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-600 mb-1 uppercase">Yarn Material</label>
                  <select
                    value={formYarnType}
                    onChange={(e) => setFormYarnType(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none font-medium"
                  >
                    <option value="Organic Wool">Organic Wool</option>
                    <option value="100% Pima Cotton">100% Pima Cotton</option>
                    <option value="Merino Blend">Merino Blend</option>
                    <option value="Natural Alpaca Yarn">Natural Alpaca Yarn</option>
                  </select>
                </div>
              </div>

              {/* PRICE & STOCK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-600 mb-1 uppercase">Price ($ USD) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none font-serif-title font-bold text-base text-[#8e4d31]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Equivalent: Rs. {Math.round(Number(formPrice || 0) * exchangeRate).toLocaleString()} PKR
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-gray-600 mb-1 uppercase">Initial Stock Units</label>
                  <input
                    required
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Product Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Handcrafted with love by our collective of women artisans..."
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] leading-relaxed"
                />
              </div>

              {/* COLOR & SIZE VARIANTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-600 mb-1 uppercase">Available Colors (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Beige, Oatmeal, Sage, Custom"
                    value={formColorsStr}
                    onChange={(e) => setFormColorsStr(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none font-medium text-xs"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[10px] text-gray-400 self-center mr-1">Quick Add:</span>
                    {["Beige", "Oatmeal", "Sage", "Cream", "Dusty Rose", "Navy Blue", "Mustard", "Custom Color"].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => {
                          const existing = formColorsStr ? formColorsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
                          if (!existing.includes(c)) {
                            setFormColorsStr([...existing, c].join(", "));
                          }
                        }}
                        className="px-2 py-0.5 bg-amber-50 border border-amber-200 hover:bg-[#8e4d31] hover:text-white rounded-md text-[10px] font-semibold text-amber-900 transition-colors"
                      >
                        + {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1 uppercase">Size Options (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0-3M, 3-6M, 6-12M or S, M, L, XL"
                    value={formSizesStr}
                    onChange={(e) => setFormSizesStr(e.target.value)}
                    className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none font-medium text-xs"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[10px] text-gray-400 self-center mr-1">Quick Add:</span>
                    {["0-3M", "3-6M", "6-12M", "1-2Y", "Small", "Medium", "Large", "Custom Size"].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => {
                          const existing = formSizesStr ? formSizesStr.split(",").map((item) => item.trim()).filter(Boolean) : [];
                          if (!existing.includes(s)) {
                            setFormSizesStr([...existing, s].join(", "));
                          }
                        }}
                        className="px-2 py-0.5 bg-gray-100 border border-gray-200 hover:bg-[#585e4c] hover:text-white rounded-md text-[10px] font-semibold text-gray-700 transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* HAND EMBROIDERY PERSONALIZATION CHECKBOX */}
              <div className="p-3 bg-[#fdfbf7] rounded-xl border border-amber-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#8e4d31] block">✨ Hand Embroidery Personalization</span>
                  <span className="text-[10px] text-gray-500">Allow customer to enter custom embroidered name (e.g. LUNA max 8 chars)</span>
                </div>
                <input
                  type="checkbox"
                  checked={formPersonalization}
                  onChange={(e) => setFormPersonalization(e.target.checked)}
                  className="w-5 h-5 accent-[#8e4d31] rounded cursor-pointer"
                />
              </div>

              {/* MODAL ACTION BUTTONS */}
              <div className="pt-3 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold uppercase hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#8e4d31] text-white rounded-xl font-bold uppercase shadow-md hover:bg-[#723c24] transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} /> {showAddModal ? "Save Product To Store" : "Update Product Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOREFRONT PREVIEW MODAL (MATCHING USER SCREENSHOT) */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#fbf9f5] rounded-3xl p-6 sm:p-8 max-w-5xl w-full space-y-6 shadow-2xl border border-[#e4e2de] max-h-[92vh] overflow-y-auto my-auto text-[#1b1c1a]">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8e4d31] flex items-center gap-1.5">
                <Sparkles size={16} /> Live Product Detail Page Replica
              </span>
              <button onClick={() => setPreviewProduct(null)} className="text-gray-400 hover:text-black p-1">
                <X size={20} />
              </button>
            </div>

            {/* Live Store replica layout matching user screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: 2-3 Thumbnails + Active Big Image */}
              <div className="md:col-span-6 flex gap-4">
                {/* Thumbnails list */}
                <div className="flex flex-col gap-3">
                  {(previewProduct.images && previewProduct.images.length > 0
                    ? previewProduct.images
                    : [previewProduct.imageUrl]
                  ).map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPreviewImg(imgUrl)}
                      className={`w-14 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedPreviewImg === imgUrl
                          ? "border-[#8e4d31] ring-2 ring-[#8e4d31]/20 shadow-md"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Big Image */}
                <div className="relative flex-grow aspect-[4/5] rounded-2xl overflow-hidden border border-[#e4e2de] bg-gray-100 shadow-lg">
                  <img
                    src={selectedPreviewImg || previewProduct.imageUrl}
                    alt={previewProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-[#8e4d31] text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-gray-200 shadow-xs">
                    {previewProduct.badge || "Organic"}
                  </span>
                </div>
              </div>

              {/* Right Column: Title, Rating, Price, Options */}
              <div className="md:col-span-6 space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e4d31]">
                    {previewProduct.category}
                  </span>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-bold leading-tight mt-1 text-[#1b1c1a]">
                    {previewProduct.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="text-amber-600 font-bold">★★★★★</span>
                    <span>({previewProduct.rating || "5.0"} / 32 reviews)</span>
                  </div>
                </div>

                <div className="font-serif-title text-3xl font-bold text-[#8e4d31]">
                  ${previewProduct.priceUSD.toFixed(2)}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {previewProduct.description || "Handcrafted slow fashion article using fine organic yarn."}
                </p>

                {/* Color selection */}
                {previewProduct.colors && previewProduct.colors.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      Color: <strong className="text-[#8e4d31]">{previewProduct.colors[0]}</strong>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {previewProduct.colors.map((color, idx) => (
                        <button
                          key={color}
                          type="button"
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            idx === 0
                              ? "bg-[#8e4d31] text-white border-[#8e4d31] shadow-xs"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[#8e4d31]"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size selection */}
                {previewProduct.sizes && previewProduct.sizes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      Size Selection
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {previewProduct.sizes.map((size, idx) => (
                        <button
                          key={size}
                          type="button"
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                            idx === 0
                              ? "bg-[#585e4c] text-white border-[#585e4c] shadow-xs"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[#585e4c]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Hand Embroidery Personalization */}
                {previewProduct.allowPersonalization && (
                  <div className="space-y-2 pt-2 border-t border-gray-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      Hand Embroidery Personalization (Optional)
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. LUNA (max 8 chars)"
                      className="w-full p-3 bg-white border border-[#c7c7bd] rounded-xl text-xs focus:outline-none"
                      readOnly
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
