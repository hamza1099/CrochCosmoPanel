import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminNavbar } from "./components/AdminNavbar";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { OrdersPage } from "./pages/OrdersPage";
import { CustomOrdersPage } from "./pages/CustomOrdersPage";
import { ArtisansPage } from "./pages/ArtisansPage";
import { BannersPage } from "./pages/BannersPage";
import { AssetsPage } from "./pages/AssetsPage";
import { LoginPage } from "./pages/LoginPage";


import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_INQUIRIES, 
  INITIAL_ARTISANS,
  INITIAL_BANNERS,
  ProductItem,
  OrderItem,
  CustomInquiry,
  Artisan,
  BannerItem,
  db,
  seedInitialDataIfEmpty,
  saveProductToDB,
  deleteProductFromDB,
  saveOrderToDB,
  saveInquiryToDB,
  saveArtisanToDB,
  deleteArtisanFromDB,
  saveBannerToDB,
  deleteBannerFromDB,
  auth
} from "./firebase";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const App: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [inquiries, setInquiries] = useState<CustomInquiry[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(280);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
      setIsAuthLoading(false);
    });
    // Listen to real-time products updates from Firestore
    const unsubProducts = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ProductItem));
        setProducts(list);
      },
      (error) => console.error("Products snapshot error:", error)
    );

    // Listen to real-time orders updates from Firestore
    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as OrderItem));
        setOrders(list);
      },
      (error) => console.error("Orders snapshot error:", error)
    );

    // Listen to real-time inquiries updates from Firestore
    const unsubInquiries = onSnapshot(
      collection(db, "custom_inquiries"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CustomInquiry));
        setInquiries(list);
      },
      (error) => console.error("Inquiries snapshot error:", error)
    );

    // Listen to real-time artisans updates from Firestore
    const unsubArtisans = onSnapshot(
      collection(db, "artisans"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Artisan));
        setArtisans(list);
      },
      (error) => console.error("Artisans snapshot error:", error)
    );

    // Listen to real-time banners updates from Firestore
    const unsubBanners = onSnapshot(
      collection(db, "banners"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BannerItem));
        setBanners(list);
      },
      (error) => console.error("Banners snapshot error:", error)
    );

    // Simulate loading for the skeleton
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubInquiries();
      unsubArtisans();
      unsubBanners();
      unsubscribeAuth();
      clearTimeout(loadingTimer);
    };
  }, []);

  // Set state wrappers that sync with Firestore DB
  const handleSetProducts: React.Dispatch<React.SetStateAction<ProductItem[]>> = (action) => {
    setProducts((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      next.forEach((item) => saveProductToDB(item));
      const nextIds = new Set(next.map((item) => item.id));
      prev.filter((p) => !nextIds.has(p.id)).forEach((p) => deleteProductFromDB(p.id));
      return next;
    });
  };

  const handleSetOrders: React.Dispatch<React.SetStateAction<OrderItem[]>> = (action) => {
    setOrders((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      next.forEach((order) => saveOrderToDB(order));
      return next;
    });
  };

  const handleSetInquiries: React.Dispatch<React.SetStateAction<CustomInquiry[]>> = (action) => {
    setInquiries((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      next.forEach((inq) => saveInquiryToDB(inq));
      return next;
    });
  };

  const handleSetArtisans: React.Dispatch<React.SetStateAction<Artisan[]>> = (action) => {
    setArtisans((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      next.forEach((art) => saveArtisanToDB(art));
      const nextIds = new Set(next.map((art) => art.id));
      prev.filter((a) => !nextIds.has(a.id)).forEach((a) => deleteArtisanFromDB(a.id));
      return next;
    });
  };

  const handleSetBanners: React.Dispatch<React.SetStateAction<BannerItem[]>> = (action) => {
    setBanners((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      next.forEach((b) => saveBannerToDB(b));
      const nextIds = new Set(next.map((b) => b.id));
      prev.filter((b) => !nextIds.has(b.id)).forEach((b) => deleteBannerFromDB(b.id));
      return next;
    });
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#585e4c]/20 border-t-[#585e4c] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <>
        <ToastContainer position="top-right" theme="light" />
        <LoginPage />
      </>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-[#f8f7f4] text-[#1b1c1a]">
        {/* Navigation Sidebar */}
        <AdminSidebar 
          ordersCount={orders.length} 
          inquiriesCount={inquiries.length}
          exchangeRate={exchangeRate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <ToastContainer 
          position="top-right" 
          theme="light"
        />

        {/* Main Content Body */}
        <div className="flex-grow flex flex-col min-w-0">
          <AdminNavbar 
            exchangeRate={exchangeRate} 
            setExchangeRate={setExchangeRate} 
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />

          <main className="flex-grow overflow-y-auto pb-12">
            {isLoading ? (
              <SkeletonLoader />
            ) : (
              <Routes>
                <Route
                path="/"
                element={
                  <DashboardPage
                    orders={orders}
                    products={products}
                    inquiries={inquiries}
                    exchangeRate={exchangeRate}
                  />
                }
              />
              <Route
                path="/products"
                element={
                  <ProductsPage
                    products={products}
                    setProducts={handleSetProducts}
                    exchangeRate={exchangeRate}
                  />
                }
              />
              <Route
                path="/orders"
                element={
                  <OrdersPage
                    orders={orders}
                    setOrders={handleSetOrders}
                    exchangeRate={exchangeRate}
                  />
                }
              />
              <Route
                path="/custom-orders"
                element={
                  <CustomOrdersPage
                    inquiries={inquiries}
                    setInquiries={handleSetInquiries}
                    exchangeRate={exchangeRate}
                  />
                }
              />
              <Route
                path="/banners"
                element={<BannersPage banners={banners} setBanners={handleSetBanners} />}
              />
              <Route
                path="/assets"
                element={
                  <AssetsPage 
                    banners={banners}
                    setBanners={handleSetBanners}
                    exchangeRate={exchangeRate} 
                    setExchangeRate={setExchangeRate} 
                  />
                }
              />
            </Routes>
            )}
          </main>
        </div>
      </div>
    </Router>
  );
};


export default App;

