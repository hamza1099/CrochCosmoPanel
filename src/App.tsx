import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminNavbar } from "./components/AdminNavbar";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { OrdersPage } from "./pages/OrdersPage";
import { CustomOrdersPage } from "./pages/CustomOrdersPage";
import { ArtisansPage } from "./pages/ArtisansPage";
import { AssetsPage } from "./pages/AssetsPage";

import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_INQUIRIES, 
  INITIAL_ARTISANS,
  ProductItem,
  OrderItem,
  CustomInquiry,
  Artisan
} from "./firebase";

export const App: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [inquiries, setInquiries] = useState<CustomInquiry[]>(INITIAL_INQUIRIES);
  const [artisans, setArtisans] = useState<Artisan[]>(INITIAL_ARTISANS);
  const [exchangeRate, setExchangeRate] = useState<number>(280);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

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

        {/* Main Content Body */}
        <div className="flex-grow flex flex-col min-w-0">
          <AdminNavbar 
            exchangeRate={exchangeRate} 
            setExchangeRate={setExchangeRate} 
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />

          <main className="flex-grow overflow-y-auto pb-12">
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
                    setProducts={setProducts}
                    exchangeRate={exchangeRate}
                  />
                }
              />
              <Route
                path="/orders"
                element={
                  <OrdersPage
                    orders={orders}
                    setOrders={setOrders}
                    exchangeRate={exchangeRate}
                  />
                }
              />
              <Route
                path="/custom-orders"
                element={
                  <CustomOrdersPage
                    inquiries={inquiries}
                    setInquiries={setInquiries}
                    exchangeRate={exchangeRate}
                  />
                }
              />
              <Route
                path="/artisans"
                element={<ArtisansPage artisans={artisans} setArtisans={setArtisans} />}
              />
              <Route
                path="/assets"
                element={
                  <AssetsPage exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} />
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
