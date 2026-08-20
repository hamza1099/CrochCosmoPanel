import React from "react";
import { Link } from "react-router-dom";
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight
} from "lucide-react";
import { OrderItem, ProductItem, CustomInquiry } from "../firebase";

interface DashboardPageProps {
  orders: OrderItem[];
  products: ProductItem[];
  inquiries: CustomInquiry[];
  exchangeRate: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  orders,
  products,
  inquiries,
  exchangeRate
}) => {
  const totalRevenueUSD = orders.reduce((sum, ord) => sum + ord.totalUSD, 0);
  const totalRevenuePKR = Math.round(totalRevenueUSD * exchangeRate);
  const pendingOrders = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
  const newInquiries = inquiries.filter((i) => i.status === "New").length;
  const inStockCount = products.filter((p) => p.inStock).length;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1b1c1a] via-[#2c2b28] to-[#363430] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8e4d31] bg-[#8e4d31]/20 px-2.5 py-1 rounded-md inline-block border border-[#8e4d31]/30">
            Executive Summary • Realtime
          </span>
          <h1 className="font-serif-title text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Store Performance Dashboard
          </h1>
          <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
            Control all catalog items, custom orders, artisan stories, and revenue analytics dynamically.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-left md:text-right w-full md:w-auto">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">Total Revenue</span>
            <span className="text-xl sm:text-2xl font-bold font-serif-title">${totalRevenueUSD.toFixed(2)} USD</span>
            <span className="text-[11px] text-gray-300 block font-medium">Rs. {totalRevenuePKR.toLocaleString()} PKR</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <Link to="/orders" className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e4e2de] shadow-xs hover:shadow-md transition-all space-y-3 block group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Gross Sales</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-[#8e4d31] group-hover:bg-[#8e4d31] group-hover:text-white transition-colors">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#1b1c1a] font-serif-title">
              ${totalRevenueUSD.toFixed(2)}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> Live Firebase Synced
            </p>
          </div>
        </Link>

        {/* Metric 2 */}
        <Link to="/orders" className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e4e2de] shadow-xs hover:shadow-md transition-all space-y-3 block group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Orders</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#1b1c1a] font-serif-title">
              {orders.length} Total
            </h3>
            <p className="text-xs text-amber-600 font-semibold">
              {pendingOrders} Pending Action
            </p>
          </div>
        </Link>

        {/* Metric 3 */}
        <Link to="/products" className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e4e2de] shadow-xs hover:shadow-md transition-all space-y-3 block group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Catalog</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#1b1c1a] font-serif-title">
              {inStockCount} / {products.length} In Stock
            </h3>
            <p className="text-xs text-emerald-600 font-semibold">
              Handcrafted Items Listed
            </p>
          </div>
        </Link>

        {/* Metric 4 */}
        <Link to="/custom-orders" className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e4e2de] shadow-xs hover:shadow-md transition-all space-y-3 block group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Custom Inquiries</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#1b1c1a] font-serif-title">
              {inquiries.length} Inquiries
            </h3>
            <p className="text-xs text-purple-600 font-semibold">
              {newInquiries} Unread Requests
            </p>
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Orders & Inquiry Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Recent Orders Stream */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e4e2de] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="font-serif-title text-xl font-bold text-[#1b1c1a]">
              Recent Orders & Sales
            </h3>
            <Link to="/orders" className="text-xs text-[#8e4d31] hover:underline font-bold uppercase tracking-wider flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <Package className="mx-auto mb-2 text-gray-300" size={32} />
                      <p className="font-semibold text-gray-600 text-sm">No orders recorded yet</p>
                      <p className="text-[11px] text-gray-400">Orders placed by customers on storefront will appear here live.</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => {
                    const calculatedPKR = Math.round(ord.totalUSD * exchangeRate);
                    return (
                      <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-[#8e4d31]">{ord.id}</td>
                        <td className="py-3.5">
                          <div className="font-bold text-[#1b1c1a]">{ord.customerName}</div>
                          <div className="text-[10px] text-gray-400">{ord.email}</div>
                        </td>
                        <td className="py-3.5 font-semibold">
                          ${ord.totalUSD.toFixed(2)}
                          <span className="block text-[10px] text-gray-400">Rs. {calculatedPKR.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 text-gray-600 font-medium">{ord.paymentMethod}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : ord.status === "Cancelled"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Inquiries Widget */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e4e2de] p-5 sm:p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-serif-title text-xl font-bold text-[#1b1c1a]">
                Bespoke Inquiries
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                {newInquiries} New
              </span>
            </div>

            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="py-8 text-center text-gray-400 space-y-2">
                  <Sparkles className="mx-auto text-purple-300" size={28} />
                  <p className="font-semibold text-gray-600 text-xs">No bespoke inquiries yet</p>
                  <p className="text-[10px] text-gray-400">Custom order requests submitted on storefront will show here.</p>
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="p-3.5 bg-[#f8f7f4] rounded-xl border border-[#e4e2de] space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-[#1b1c1a]">{inq.customerName}</h4>
                        <span className="text-[10px] text-[#8e4d31] font-semibold block">{inq.itemType}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                      "{inq.specs}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Link
              to="/custom-orders"
              className="w-full py-2.5 bg-[#585e4c] hover:bg-[#717763] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Review All Inquiries <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
