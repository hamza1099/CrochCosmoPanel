import React, { useState } from "react";
import { Search, Mail, Phone, Trash2, Package, Copy, Check, MessageSquare } from "lucide-react";
import { OrderItem, deleteOrderFromDB } from "../firebase";
import { ConfirmModal } from "../components/ConfirmModal";
import { toast } from "react-toastify";

interface OrdersPageProps {
  orders: OrderItem[];
  setOrders: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  exchangeRate: number;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders, setOrders, exchangeRate }) => {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const updateOrderStatus = (orderId: string, newStatus: OrderItem["status"]) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Tracking ID ${id} copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      setOrders((prev) => prev.filter((ord) => ord.id !== orderToDelete));
      await deleteOrderFromDB(orderToDelete);
      setOrderToDelete(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "All" || o.status === filterStatus;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <ConfirmModal
        isOpen={!!orderToDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setOrderToDelete(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8e4d31]">
            Sales & Dispatch Control
          </span>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1b1c1a]">
            Customer Orders & Workflow
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e4e2de]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-grow md:flex-grow-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#f8f7f4] border border-[#c7c7bd] rounded-xl text-xs w-full md:w-64 focus:outline-none focus:border-[#8e4d31]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-[#f8f7f4] p-1 rounded-xl border border-[#e4e2de]">
            {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === status
                    ? "bg-[#8e4d31] text-white shadow-xs"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-gray-500 self-center">
          Showing <strong className="text-[#1b1c1a]">{filteredOrders.length}</strong> orders
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#e4e2de] space-y-3">
            <Package className="mx-auto text-gray-300" size={40} />
            <h3 className="text-base font-bold text-gray-700">No Orders Received Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">When customers place orders on your storefront app, they will automatically appear here in real-time.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const calculatedPKR = Math.round(ord.totalUSD * exchangeRate);
            const cleanPhone = ord.phone ? ord.phone.replace(/\D/g, "") : "";
            const waMessage = encodeURIComponent(
              `Hello ${ord.customerName}! Thank you for your order at CrochCosmo.\n\nYour Order Tracking ID is: *${ord.id}*\n\nYou can track your order status live anytime using this Tracking ID on our website.`
            );
            const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-[#e4e2de] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8e4d31] flex items-center justify-center font-bold font-mono text-base border border-amber-200">
                      #
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-mono font-bold text-[#8e4d31] text-base">{ord.id}</h3>
                        <button
                          onClick={() => handleCopyId(ord.id)}
                          className="px-2 py-0.5 bg-[#f5f3ef] hover:bg-[#e4e2de] text-[#585e4c] rounded text-[11px] font-semibold flex items-center gap-1 transition-colors border border-[#c7c7bd]"
                          title="Copy Tracking ID"
                        >
                          {copiedId === ord.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                          <span>{copiedId === ord.id ? "Copied" : "Copy ID"}</span>
                        </button>

                        {cleanPhone && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-0.5 bg-green-50 hover:bg-green-100 text-green-700 rounded text-[11px] font-bold flex items-center gap-1 transition-colors border border-green-200"
                            title="Send Tracking ID on WhatsApp"
                          >
                            <MessageSquare size={12} />
                            <span>WhatsApp ID</span>
                          </a>
                        )}

                        <span className="text-xs text-gray-400">Placed on {ord.date}</span>
                      </div>
                      <span className="text-xs text-gray-600 font-semibold">{ord.itemsCount} Handcrafted Item(s)</span>
                    </div>
                  </div>

                  {/* Status Selector & Actions */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderItem["status"])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase focus:outline-none border cursor-pointer ${
                        ord.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : ord.status === "Shipped"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : ord.status === "Processing"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : ord.status === "Cancelled"
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : "bg-gray-100 text-gray-800 border-gray-300"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => setOrderToDelete(ord.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Customer Details & Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-400 font-bold uppercase block">Customer Details</span>
                    <h4 className="font-bold text-[#1b1c1a] text-sm">{ord.customerName}</h4>
                    <p className="text-gray-500 flex items-center gap-1.5"><Mail size={12} /> {ord.email}</p>
                    <p className="text-gray-500 flex items-center gap-1.5"><Phone size={12} /> {ord.phone}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-bold uppercase block">Payment & Currency</span>
                    <p className="font-bold text-[#1b1c1a]">{ord.paymentMethod}</p>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600 border border-gray-200">
                      Currency Mode: {ord.currency}
                    </span>
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <span className="text-gray-400 font-bold uppercase block">Total Amount</span>
                    <h3 className="font-serif-title font-bold text-2xl text-[#8e4d31]">
                      ${ord.totalUSD.toFixed(2)} USD
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Rs. {calculatedPKR.toLocaleString()} PKR
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
