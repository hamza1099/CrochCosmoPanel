import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PackageCheck, 
  Sparkles, 
  Users, 
  Image, 
  Layers,
  Store,
  X,
  LogOut,
  GraduationCap,
  Video
} from "lucide-react";
import logoUrl from "../assets/Logo.jpg";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";

interface AdminSidebarProps {
  ordersCount: number;
  inquiriesCount: number;
  masterclassesCount?: number;
  exchangeRate: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  ordersCount, 
  inquiriesCount, 
  masterclassesCount,
  exchangeRate,
  isOpen, 
  onClose 
}) => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Products & Stock", path: "/products", icon: ShoppingBag },
    { label: "Orders Manager", path: "/orders", icon: PackageCheck, badge: ordersCount },
    { label: "Custom Inquiries", path: "/custom-orders", icon: Sparkles, badge: inquiriesCount },
    { label: "Masterclasses", path: "/masterclasses", icon: GraduationCap, badge: masterclassesCount },
    { label: "Video Tutorials", path: "/tutorials", icon: Video },
    { label: "Hero Banners", path: "/banners", icon: Image },
    { label: "Popular Categories", path: "/popular-categories", icon: Layers },
    { label: "Site Assets", path: "/assets", icon: Store },
  ];



  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#585e4c] text-white flex flex-col justify-between p-4 border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="pt-2 px-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-lg overflow-hidden border border-white/20">
                <img src={logoUrl} alt="CrochCosmo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-serif-title text-xl font-bold tracking-wide text-white leading-tight">
                  CrochCosmo
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-100/80 block">
                  Control Hub • Admin
                </span>
              </div>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#44493b] text-white shadow-md shadow-black/20 font-bold"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-white/10 space-y-3 mt-auto">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/15 text-xs text-white font-medium rounded-xl transition-all"
          >
            <Store size={14} />
            View Live Store Front →
          </a>
          <button
            onClick={() => {
              signOut(auth)
                .then(() => toast.info("Logged out successfully"))
                .catch((error) => console.error(error));
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-300 font-medium rounded-xl transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
          <div className="text-center pt-2">
            <p className="text-[11px] text-gray-400">Firebase Backend v10.12</p>
            <p className="text-[10px] text-amber-400 font-semibold mt-0.5">PKR Rate: 1 USD = {exchangeRate} PKR</p>
          </div>
        </div>
      </aside>
    </>
  );
};
