// Admin Panel API Service integrated with direct Firebase SDK
import { 
  fetchProductsFromDB, 
  saveProductToDB, 
  deleteProductFromDB,
  fetchOrdersFromDB,
  saveOrderToDB,
  fetchInquiriesFromDB,
  saveInquiryToDB,
  fetchArtisansFromDB,
  saveArtisanToDB,
  deleteArtisanFromDB,
  fetchBannersFromDB,
  saveBannerToDB,
  deleteBannerFromDB
} from "../firebase";

export const apiService = {
  // Admin Stats
  getStats: async () => {
    const products = await fetchProductsFromDB();
    const orders = await fetchOrdersFromDB();
    const inquiries = await fetchInquiriesFromDB();
    const artisans = await fetchArtisansFromDB();

    const totalRevenueUSD = orders.reduce((sum, o) => sum + Number(o.totalUSD || 0), 0);
    const totalRevenuePKR = orders.reduce((sum, o) => sum + Number(o.totalPKR || (o.totalUSD || 0) * 280), 0);

    return {
      success: true,
      stats: {
        totalRevenueUSD: Number(totalRevenueUSD.toFixed(2)),
        totalRevenuePKR: Math.round(totalRevenuePKR),
        totalOrdersCount: orders.length,
        pendingOrdersCount: orders.filter(o => o.status === "Pending" || o.status === "Processing").length,
        pendingInquiriesCount: inquiries.filter(i => i.status === "New" || i.status === "In Review").length,
        totalProductsCount: products.length,
        totalArtisansCount: artisans.length,
        lowStockCount: products.filter(p => (p.stockQuantity || 0) <= 5).length
      },
      recentOrders: orders.slice(0, 5),
      recentInquiries: inquiries.slice(0, 5)
    };
  },

  // Products CRUD
  getProducts: async () => ({ success: true, products: await fetchProductsFromDB() }),
  getProductById: async (id: string) => {
    const products = await fetchProductsFromDB();
    const product = products.find(p => p.id === id);
    return product ? { success: true, product } : { success: false, message: "Not found" };
  },
  createProduct: async (product: any) => {
    await saveProductToDB(product);
    return { success: true, product };
  },
  updateProduct: async (id: string, product: any) => {
    await saveProductToDB({ ...product, id });
    return { success: true, product };
  },
  deleteProduct: async (id: string) => {
    await deleteProductFromDB(id);
    return { success: true };
  },

  // Orders
  getOrders: async () => ({ success: true, orders: await fetchOrdersFromDB() }),
  updateOrderStatus: async (id: string, status: string) => {
    const orders = await fetchOrdersFromDB();
    const order = orders.find(o => o.id === id);
    if (order) {
      const updated = { ...order, status: status as any };
      await saveOrderToDB(updated);
      return { success: true, order: updated };
    }
    return { success: false };
  },

  // Inquiries
  getInquiries: async () => ({ success: true, inquiries: await fetchInquiriesFromDB() }),
  updateInquiry: async (id: string, data: any) => {
    const inquiries = await fetchInquiriesFromDB();
    const inquiry = inquiries.find(i => i.id === id);
    if (inquiry) {
      const updated = { ...inquiry, ...data, id };
      await saveInquiryToDB(updated);
      return { success: true, inquiry: updated };
    }
    return { success: false };
  },

  // Artisans
  getArtisans: async () => ({ success: true, artisans: await fetchArtisansFromDB() }),
  createArtisan: async (artisan: any) => {
    await saveArtisanToDB(artisan);
    return { success: true, artisan };
  },
  updateArtisan: async (id: string, artisan: any) => {
    await saveArtisanToDB({ ...artisan, id });
    return { success: true, artisan };
  },
  deleteArtisan: async (id: string) => {
    await deleteArtisanFromDB(id);
    return { success: true };
  },

  // Banners
  getBanners: async () => ({ success: true, banners: await fetchBannersFromDB() }),
  createBanner: async (banner: any) => {
    await saveBannerToDB(banner);
    return { success: true, banner };
  },
  updateBanner: async (id: string, banner: any) => {
    await saveBannerToDB({ ...banner, id });
    return { success: true, banner };
  },
  deleteBanner: async (id: string) => {
    await deleteBannerFromDB(id);
    return { success: true };
  }
};
