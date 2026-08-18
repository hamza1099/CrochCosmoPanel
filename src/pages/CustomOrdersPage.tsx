import React, { useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { CustomInquiry } from "../firebase";

interface CustomOrdersPageProps {
  inquiries: CustomInquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<CustomInquiry[]>>;
  exchangeRate: number;
}

export const CustomOrdersPage: React.FC<CustomOrdersPageProps> = ({
  inquiries,
  setInquiries,
  exchangeRate
}) => {
  const [editingInquiryId, setEditingInquiryId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(150);

  const updateStatus = (id: string, newStatus: CustomInquiry["status"]) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );
  };

  const submitQuote = (id: string) => {
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id ? { ...inq, estimatedPriceUSD: quotePrice, status: "Quoted" } : inq
      )
    );
    setEditingInquiryId(null);
  };

  const deleteInquiry = (id: string) => {
    if (confirm("Are you sure you want to delete this custom inquiry?")) {
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8e4d31]">
            Bespoke Crafts Reviewer
          </span>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1b1c1a]">
            Custom Order Inquiries & Price Quotes
          </h1>
        </div>
      </div>

      {/* Inquiry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white rounded-2xl border border-[#e4e2de] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#8e4d31] font-bold">{inq.id}</span>
                    <button
                      onClick={() => deleteInquiry(inq.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h3 className="font-bold text-[#1b1c1a] text-lg">{inq.customerName}</h3>
                  <span className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Mail size={12} /> {inq.email}
                  </span>
                </div>
                <select
                  value={inq.status}
                  onChange={(e) => updateStatus(inq.id, e.target.value as CustomInquiry["status"])}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase border cursor-pointer ${
                    inq.status === "New"
                      ? "bg-purple-100 text-purple-800 border-purple-300"
                      : inq.status === "Quoted"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300"
                  }`}
                >
                  <option value="New">New Inquiry</option>
                  <option value="In Review">In Review</option>
                  <option value="Quoted">Quoted</option>
                  <option value="In Production">In Production</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Item Type & Specs */}
              <div>
                <span className="text-xs font-bold text-[#8e4d31] uppercase tracking-wider block">
                  Category: {inq.itemType}
                </span>
                <p className="mt-2 text-xs text-[#464840] bg-[#f8f7f4] p-3.5 rounded-xl border border-[#e4e2de] leading-relaxed">
                  "{inq.specs}"
                </p>
              </div>
            </div>

            {/* Quote Action */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {inq.estimatedPriceUSD ? (
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Quoted Price</span>
                  <span className="font-serif-title text-xl font-bold text-[#8e4d31]">
                    ${inq.estimatedPriceUSD.toFixed(2)} USD
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    Rs. {Math.round(inq.estimatedPriceUSD * exchangeRate).toLocaleString()} PKR
                  </span>
                </div>
              ) : (
                <span className="text-xs text-amber-600 font-semibold italic">No Quote Sent Yet</span>
              )}

              {editingInquiryId === inq.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(Number(e.target.value))}
                    className="w-20 p-2 border border-[#c7c7bd] rounded-xl text-xs font-bold focus:outline-none focus:border-[#8e4d31]"
                  />
                  <button
                    onClick={() => submitQuote(inq.id)}
                    className="px-3 py-2 bg-[#8e4d31] hover:bg-[#723c24] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setEditingInquiryId(null)}
                    className="px-2 py-2 bg-gray-100 text-gray-600 text-xs rounded-xl"
                  >
                    X
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingInquiryId(inq.id);
                    setQuotePrice(inq.estimatedPriceUSD || 150);
                  }}
                  className="px-4 py-2 bg-[#585e4c] hover:bg-[#717763] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-xs"
                >
                  {inq.estimatedPriceUSD ? "Update Quote" : "Quote Price"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
