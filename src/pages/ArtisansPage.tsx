import React, { useState } from "react";
import { Plus, Award, Trash2, Edit2, X } from "lucide-react";
import { Artisan } from "../firebase";

interface ArtisansPageProps {
  artisans: Artisan[];
  setArtisans: React.Dispatch<React.SetStateAction<Artisan[]>>;
}

export const ArtisansPage: React.FC<ArtisansPageProps> = ({ artisans, setArtisans }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArtisan, setEditingArtisan] = useState<Artisan | null>(null);

  const [newArtisan, setNewArtisan] = useState<Partial<Artisan>>({
    name: "",
    role: "Master Crochet Artisan",
    bio: "",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    yearsExperience: 5
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtisan.name) return;

    const item: Artisan = {
      id: `artisan-${Date.now()}`,
      name: newArtisan.name || "",
      role: newArtisan.role || "Master Crochet Artisan",
      bio: newArtisan.bio || "",
      imageUrl: newArtisan.imageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
      yearsExperience: Number(newArtisan.yearsExperience) || 5
    };

    setArtisans((prev) => [...prev, item]);
    setShowAddModal(false);
    setNewArtisan({
      name: "",
      role: "Master Crochet Artisan",
      bio: "",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
      yearsExperience: 5
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtisan) return;

    setArtisans((prev) =>
      prev.map((a) => (a.id === editingArtisan.id ? editingArtisan : a))
    );
    setEditingArtisan(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this artisan profile?")) {
      setArtisans((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8e4d31]">
            Artisan Guild Roster
          </span>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1b1c1a]">
            Master Artisans & Craft Makers
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-[#8e4d31] hover:bg-[#723c24] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Artisan Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {artisans.map((artisan) => (
          <div
            key={artisan.id}
            className="bg-white rounded-3xl overflow-hidden border border-[#e4e2de] shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row"
          >
            <img
              src={artisan.imageUrl}
              alt={artisan.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80";
              }}
              className="w-full sm:w-48 h-60 sm:h-auto object-cover bg-[#f8f7f4]"
            />
            <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-serif-title text-2xl font-bold text-[#1b1c1a]">
                    {artisan.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingArtisan(artisan)}
                      className="p-1.5 text-gray-500 hover:text-[#8e4d31] rounded-lg transition-colors"
                      title="Edit Artisan"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(artisan.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg transition-colors"
                      title="Delete Artisan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e4d31] block mt-0.5">
                  {artisan.role}
                </span>
                <p className="mt-3 text-xs text-[#464840] leading-relaxed">
                  {artisan.bio}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold">
                <span className="flex items-center gap-1.5 text-[#8e4d31]">
                  <Award size={15} /> {artisan.yearsExperience} Years Guild Member
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-[#e4e2de] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-serif-title text-2xl font-bold text-[#1b1c1a]">Add Artisan Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Elena Rustam"
                  value={newArtisan.name}
                  onChange={(e) => setNewArtisan({ ...newArtisan, name: e.target.value })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Role & Title</label>
                <input
                  type="text"
                  placeholder="Master Crochet Artisan"
                  value={newArtisan.role}
                  onChange={(e) => setNewArtisan({ ...newArtisan, role: e.target.value })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Years Experience</label>
                <input
                  type="number"
                  value={newArtisan.yearsExperience}
                  onChange={(e) => setNewArtisan({ ...newArtisan, yearsExperience: Number(e.target.value) })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Bio / Story</label>
                <textarea
                  rows={3}
                  placeholder="Describe artisan story and impact..."
                  value={newArtisan.bio}
                  onChange={(e) => setNewArtisan({ ...newArtisan, bio: e.target.value })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Photo URL</label>
                <input
                  type="text"
                  value={newArtisan.imageUrl}
                  onChange={(e) => setNewArtisan({ ...newArtisan, imageUrl: e.target.value })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#8e4d31] text-white rounded-xl font-bold uppercase shadow-md hover:bg-[#723c24]"
                >
                  Save Artisan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingArtisan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-[#e4e2de] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-serif-title text-2xl font-bold text-[#1b1c1a]">Edit Artisan Profile</h3>
              <button onClick={() => setEditingArtisan(null)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Full Name</label>
                <input
                  required
                  type="text"
                  value={editingArtisan.name}
                  onChange={(e) => setEditingArtisan({ ...editingArtisan, name: e.target.value })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Role & Title</label>
                <input
                  type="text"
                  value={editingArtisan.role}
                  onChange={(e) => setEditingArtisan({ ...editingArtisan, role: e.target.value })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Years Experience</label>
                <input
                  type="number"
                  value={editingArtisan.yearsExperience}
                  onChange={(e) => setEditingArtisan({ ...editingArtisan, yearsExperience: Number(e.target.value) })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Bio / Story</label>
                <textarea
                  rows={3}
                  value={editingArtisan.bio}
                  onChange={(e) => setEditingArtisan({ ...editingArtisan, bio: e.target.value })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1 uppercase">Photo URL</label>
                <input
                  type="text"
                  value={editingArtisan.imageUrl}
                  onChange={(e) => setEditingArtisan({ ...editingArtisan, imageUrl: e.target.value })}
                  className="w-full p-3 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingArtisan(null)}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#8e4d31] text-white rounded-xl font-bold uppercase shadow-md hover:bg-[#723c24]"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
