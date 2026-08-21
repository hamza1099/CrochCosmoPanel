import React, { useState } from "react";
import { Plus, Edit2, Trash2, ExternalLink, Video, Upload, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { TutorialItem, saveTutorialToDB, deleteTutorialFromDB, uploadImageToFirebaseStorage } from "../firebase";
import { ConfirmModal } from "../components/ConfirmModal";
import { toast } from "react-toastify";

interface TutorialsPageProps {
  tutorials: TutorialItem[];
  setTutorials: React.Dispatch<React.SetStateAction<TutorialItem[]>>;
}

export const TutorialsPage: React.FC<TutorialsPageProps> = ({ tutorials, setTutorials }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<TutorialItem | null>(null);
  const [tutorialToDelete, setTutorialToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);

  const openModalForNew = () => {
    setEditingTutorial(null);
    setTitle("");
    setDescription("");
    setDuration("05:00");
    setImageUrl("");
    setVideoUrl("");
    setOrder(tutorials.length + 1);
    setActive(true);
    setIsModalOpen(true);
  };

  const openModalForEdit = (tut: TutorialItem) => {
    setEditingTutorial(tut);
    setTitle(tut.title);
    setDescription(tut.description || "");
    setDuration(tut.duration || "05:00");
    setImageUrl(tut.imageUrl || "");
    setVideoUrl(tut.videoUrl || "");
    setOrder(tut.order || 1);
    setActive(tut.active);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImageToFirebaseStorage(file, "tutorials");
      setImageUrl(url);
      toast.success("Thumbnail image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed uploading image. Try image URL instead.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a video title");
      return;
    }
    if (!videoUrl.trim()) {
      toast.error("Please enter a YouTube video URL");
      return;
    }

    const newTutorial: TutorialItem = {
      id: editingTutorial ? editingTutorial.id : `tut-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      duration: duration.trim() || "05:00",
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1619252584172-a83a949b6efd?w=800&q=80",
      videoUrl: videoUrl.trim(),
      active,
      order: Number(order) || 1,
    };

    try {
      await saveTutorialToDB(newTutorial);
      setTutorials((prev) => {
        const index = prev.findIndex((t) => t.id === newTutorial.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newTutorial;
          return updated.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        return [...prev, newTutorial].sort((a, b) => (a.order || 0) - (b.order || 0));
      });
      toast.success(editingTutorial ? "Tutorial updated successfully!" : "New Video Tutorial added!");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed saving tutorial");
    }
  };

  const confirmDelete = async () => {
    if (tutorialToDelete) {
      try {
        await deleteTutorialFromDB(tutorialToDelete);
        setTutorials((prev) => prev.filter((t) => t.id !== tutorialToDelete));
        toast.info("Tutorial deleted");
      } catch (err) {
        console.error(err);
        toast.error("Failed deleting tutorial");
      } finally {
        setTutorialToDelete(null);
      }
    }
  };

  const sortedTutorials = [...tutorials].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const list = [...sortedTutorials];
    const current = { ...list[index] };
    const prev = { ...list[index - 1] };

    const tempOrder = current.order || (index + 1);
    current.order = prev.order || index;
    prev.order = tempOrder;

    list[index] = current;
    list[index - 1] = prev;

    setTutorials(list.sort((a, b) => (a.order || 0) - (b.order || 0)));
    try {
      await saveTutorialToDB(current);
      await saveTutorialToDB(prev);
      toast.success("Order updated!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveDown = async (index: number) => {
    const list = [...sortedTutorials];
    if (index >= list.length - 1) return;
    const current = { ...list[index] };
    const next = { ...list[index + 1] };

    const tempOrder = current.order || (index + 1);
    current.order = next.order || (index + 2);
    next.order = tempOrder;

    list[index] = current;
    list[index + 1] = next;

    setTutorials(list.sort((a, b) => (a.order || 0) - (b.order || 0)));
    try {
      await saveTutorialToDB(current);
      await saveTutorialToDB(next);
      toast.success("Order updated!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <ConfirmModal
        isOpen={!!tutorialToDelete}
        title="Delete Video Tutorial"
        message="Are you sure you want to delete this video tutorial? It will be removed from the Learning Hub."
        onConfirm={confirmDelete}
        onCancel={() => setTutorialToDelete(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8e4d31]">
            Learning Hub Management
          </span>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1b1c1a]">
            Video Tutorials & YouTube Links
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Add, delete, edit, and reorder video tutorials shown on customer website.
          </p>
        </div>

        <button
          onClick={openModalForNew}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#585e4c] hover:bg-[#717763] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <Plus size={16} />
          <span>Add Video Tutorial</span>
        </button>
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTutorials.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-[#e4e2de] space-y-3">
            <Video className="mx-auto text-gray-300" size={48} />
            <h3 className="text-base font-bold text-gray-700">No Video Tutorials Added</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Add video tutorial links from your YouTube channel so customers can click and watch them directly.
            </p>
            <button
              onClick={openModalForNew}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#8e4d31] text-white text-xs font-bold rounded-xl"
            >
              <Plus size={14} /> Add First Video
            </button>
          </div>
        ) : (
          sortedTutorials.map((tut, index) => (
            <div
              key={tut.id}
              className="bg-white rounded-2xl border border-[#e4e2de] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image Thumbnail with Overlay */}
                <div className="relative aspect-video bg-[#f5f3ef] overflow-hidden">
                  <img
                    src={tut.imageUrl}
                    alt={tut.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  {/* Duration Badge */}
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded backdrop-blur-xs">
                    {tut.duration}
                  </span>

                  {/* Active Badge */}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border shadow-xs ${
                      tut.active
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-gray-100 text-gray-600 border-gray-300"
                    }`}
                  >
                    {tut.active ? "Published" : "Draft"}
                  </span>

                  {/* Order Badge */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold rounded-full backdrop-blur-xs">
                    Order: #{tut.order || index + 1}
                  </span>
                </div>

                {/* Info Content */}
                <div className="p-5 space-y-2">
                  <h3 className="font-serif-title font-bold text-base text-[#1b1c1a] group-hover:text-[#8e4d31] transition-colors line-clamp-2">
                    {tut.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {tut.description || "No description provided."}
                  </p>

                  <div className="pt-2 text-[11px] text-[#585e4c] font-medium font-mono truncate">
                    🔗 {tut.videoUrl}
                  </div>
                </div>
              </div>

              {/* Actions & Reordering Footer */}
              <div className="px-5 py-3 bg-[#f8f7f4] border-t border-[#e4e2de] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 disabled:opacity-30 rounded-lg transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sortedTutorials.length - 1}
                    className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 disabled:opacity-30 rounded-lg transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <a
                    href={tut.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-xs font-bold text-[#8e4d31] hover:underline flex items-center gap-1"
                  >
                    <Eye size={13} />
                    <ExternalLink size={11} />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModalForEdit(tut)}
                    className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit Tutorial"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setTutorialToDelete(tut.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Tutorial"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in duration-200 border border-[#e4e2de]">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="font-serif-title font-bold text-xl text-[#1b1c1a]">
                {editingTutorial ? "Edit Video Tutorial" : "Add New Video Tutorial"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Video Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Foundation Stitches: Chain & Slip Knot"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  YouTube Video Link (URL) *
                </label>
                <input
                  required
                  type="url"
                  placeholder="e.g. https://www.youtube.com/watch?v=VIDEO_ID"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] text-xs font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  When users click this tutorial on your website, it will open this exact YouTube video URL.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Video Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 08:45"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Publish Status
                  </label>
                  <select
                    value={active ? "active" : "draft"}
                    onChange={(e) => setActive(e.target.value === "active")}
                    className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] text-xs font-bold"
                  >
                    <option value="active">Published</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of what users will learn in this tutorial..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] text-xs"
                />
              </div>

              {/* Thumbnail Image Upload / URL */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Thumbnail Image
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <label className="px-3.5 py-2 bg-white border border-[#c7c7bd] hover:bg-[#f5f3ef] rounded-xl cursor-pointer text-xs font-bold text-[#585e4c] flex items-center gap-1.5 transition-colors">
                    <Upload size={14} />
                    <span>{isUploading ? "Uploading..." : "Upload Local Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">OR</span>
                </div>

                <input
                  type="text"
                  placeholder="Paste image URL here..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl focus:outline-none focus:border-[#8e4d31] text-xs"
                />

                {imageUrl && (
                  <div className="mt-2 w-24 h-16 rounded-xl overflow-hidden border border-[#c7c7bd]">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-[#8e4d31] hover:bg-[#71361d] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {editingTutorial ? "Update Tutorial" : "Add Tutorial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

