import React from "react";
import { Bell, Search, RefreshCw, ShieldCheck, Menu } from "lucide-react";

interface AdminNavbarProps {
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  onToggleSidebar: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ 
  exchangeRate, 
  setExchangeRate,
  onToggleSidebar
}) => {
  return (
    <header className="h-16 bg-white border-b border-[#e4e2de] px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30">
      {/* Left side: Hamburger + Search & Status Indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-700 hover:text-[#8e4d31] rounded-xl hover:bg-[#f8f7f4] transition-all"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, catalog..."
            className="pl-9 pr-3 py-1.5 bg-[#f8f7f4] border border-[#d9d6ce] rounded-xl text-xs text-[#1b1c1a] focus:outline-none focus:border-[#8e4d31] w-36 sm:w-60 md:w-80 transition-all"
          />
        </div>

        <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
          <ShieldCheck size={14} /> Firebase Live Connected
        </span>
      </div>

      {/* Right Controls: Exchange Rate + Notifications + Admin Badge */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#f8f7f4] border border-[#d9d6ce] px-2.5 py-1 sm:py-1.5 rounded-xl text-xs">
          <span className="text-gray-500 font-medium text-[11px] sm:text-xs">USD ➔ PKR:</span>
          <input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Number(e.target.value))}
            className="w-12 sm:w-16 bg-white border border-[#c7c7bd] rounded px-1 py-0.5 font-bold text-[#8e4d31] text-center focus:outline-none text-xs"
          />
          <RefreshCw size={12} className="text-gray-400 cursor-pointer hover:rotate-180 transition-transform" />
        </div>

        <button className="relative p-2 text-gray-600 hover:text-black rounded-xl hover:bg-gray-100 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8e4d31] rounded-full animate-ping"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#e4e2de]">
          <div className="w-8 h-8 rounded-full bg-[#8e4d31] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-xs font-bold text-[#1b1c1a] leading-tight">Store Admin</h4>
            <span className="text-[10px] text-[#8e4d31] font-semibold block">Super User</span>
          </div>
        </div>
      </div>
    </header>
  );
};
