import { initializeApp, getApps } from "firebase/app";
import {
  initializeFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBIpRs20fov6-BF3urlkVVxsPNDomfF2qQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crochetcomso.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crochetcomso",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crochetcomso.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "370920891701",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:370920891701:web:ba88f1bfa58ada325f587c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});
export const auth = getAuth(app);
export const storage = getStorage(app);

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  yarnType: string;
  priceUSD: number;
  rating: number;
  badge: string;
  imageUrl: string;
  images?: string[];
  description?: string;
  colors?: string[];
  sizes?: string[];
  allowPersonalization?: boolean;
  stockQuantity: number;
  inStock: boolean;
}

export interface OrderItem {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  totalUSD: number;
  totalPKR: number;
  currency: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod: string;
  paymentDetails?: {
    methodName?: string;
    accountTitle?: string;
    accountNumber?: string;
    iban?: string;
    senderAccount?: string;
    transactionId?: string;
    screenshotUrl?: string;
    note?: string;
  };
  date: string;
  itemsCount: number;
}

export interface CustomInquiry {
  id: string;
  customerName: string;
  email: string;
  itemType: string;
  specs: string;
  status: "New" | "In Review" | "Quoted" | "In Production" | "Completed";
  estimatedPriceUSD?: number;
  date: string;
}

export interface Artisan {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  yearsExperience: number;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
}

export interface PopularCategoryItem {
  id: string;
  title: string;
  categoryName: string;
  imageUrl: string;
  active: boolean;
  order: number;
}

export const INITIAL_PRODUCTS: ProductItem[] = [];
export const INITIAL_ORDERS: OrderItem[] = [];
export const INITIAL_INQUIRIES: CustomInquiry[] = [];
export const INITIAL_ARTISANS: Artisan[] = [];
export const INITIAL_BANNERS: BannerItem[] = [];
export const INITIAL_POPULAR_CATEGORIES: PopularCategoryItem[] = [];


// Helper to upload image files directly to Firebase Storage
export const uploadImageToFirebaseStorage = async (file: File, folder: string = "products"): Promise<string> => {
  try {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    throw error;
  }
};

// --- DIRECT FIRESTORE HELPERS ---

export const seedInitialDataIfEmpty = async () => {
  // Pure dynamic data mode: No auto seeding of dummy data
  return;
};

export const fetchProductsFromDB = async (): Promise<ProductItem[]> => {
  try {
    const snap = await getDocs(collection(db, "products"));
    if (snap.empty) return [];
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ProductItem));
  } catch (err) {
    console.error("Error fetching products from Firestore:", err);
    return [];
  }
};

export const saveProductToDB = async (product: ProductItem) => {
  try {
    const pId = product.id || `prod-${Date.now()}`;
    await setDoc(doc(db, "products", pId), { ...product, id: pId });
  } catch (err) {
    console.error("Error saving product to Firestore:", err);
  }
};

export const deleteProductFromDB = async (id: string) => {
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (err) {
    console.error("Error deleting product from Firestore:", err);
  }
};

export const fetchOrdersFromDB = async (): Promise<OrderItem[]> => {
  try {
    const snap = await getDocs(collection(db, "orders"));
    if (snap.empty) return [];
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as OrderItem));
  } catch (err) {
    console.error("Error fetching orders from Firestore:", err);
    return [];
  }
};

export const saveOrderToDB = async (order: OrderItem) => {
  try {
    await setDoc(doc(db, "orders", order.id), order, { merge: true });
  } catch (err) {
    console.error("Error saving order to Firestore:", err);
  }
};

export const deleteOrderFromDB = async (id: string) => {
  try {
    await deleteDoc(doc(db, "orders", id));
  } catch (err) {
    console.error("Error deleting order from Firestore:", err);
  }
};

export const fetchInquiriesFromDB = async (): Promise<CustomInquiry[]> => {
  try {
    const snap = await getDocs(collection(db, "custom_inquiries"));
    if (snap.empty) return [];
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CustomInquiry));
  } catch (err) {
    console.error("Error fetching inquiries from Firestore:", err);
    return [];
  }
};

export const saveInquiryToDB = async (inquiry: CustomInquiry) => {
  try {
    await setDoc(doc(db, "custom_inquiries", inquiry.id), inquiry, { merge: true });
  } catch (err) {
    console.error("Error saving inquiry to Firestore:", err);
  }
};

export const deleteInquiryFromDB = async (id: string) => {
  try {
    await deleteDoc(doc(db, "custom_inquiries", id));
  } catch (err) {
    console.error("Error deleting inquiry from Firestore:", err);
  }
};

export const fetchArtisansFromDB = async (): Promise<Artisan[]> => {
  try {
    const snap = await getDocs(collection(db, "artisans"));
    if (snap.empty) return [];
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Artisan));
  } catch (err) {
    console.error("Error fetching artisans from Firestore:", err);
    return [];
  }
};

export const saveArtisanToDB = async (artisan: Artisan) => {
  try {
    const aId = artisan.id || `artisan-${Date.now()}`;
    await setDoc(doc(db, "artisans", aId), { ...artisan, id: aId });
  } catch (err) {
    console.error("Error saving artisan to Firestore:", err);
  }
};

export const deleteArtisanFromDB = async (id: string) => {
  try {
    await deleteDoc(doc(db, "artisans", id));
  } catch (err) {
    console.error("Error deleting artisan from Firestore:", err);
  }
};

export const fetchBannersFromDB = async (): Promise<BannerItem[]> => {
  try {
    const snap = await getDocs(collection(db, "banners"));
    if (snap.empty) return [];
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BannerItem));
  } catch (err) {
    console.error("Error fetching banners from Firestore:", err);
    return [];
  }
};

export const saveBannerToDB = async (banner: BannerItem) => {
  try {
    const bId = banner.id || `banner-${Date.now()}`;
    await setDoc(doc(db, "banners", bId), { ...banner, id: bId });
  } catch (err) {
    console.error("Error saving banner to Firestore:", err);
  }
};

export const deleteBannerFromDB = async (id: string) => {
  try {
    await deleteDoc(doc(db, "banners", id));
  } catch (err) {
    console.error("Error deleting banner from Firestore:", err);
  }
};

export const fetchPopularCategoriesFromDB = async (): Promise<PopularCategoryItem[]> => {
  try {
    const snap = await getDocs(collection(db, "popular_categories"));
    if (snap.empty) return [];
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PopularCategoryItem));
  } catch (err) {
    console.error("Error fetching popular categories from Firestore:", err);
    return [];
  }
};

export interface CategoryBannersConfig {
  womenBannerUrl: string;
  womenBannerTagline: string;
  menBannerUrl: string;
  menBannerTagline: string;
  babyBannerUrl: string;
  babyBannerTagline: string;
}

export const fetchCategoryBannersDB = async (): Promise<CategoryBannersConfig | null> => {
  try {
    const docRef = doc(db, "settings", "category_banners");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as CategoryBannersConfig;
    }
    return null;
  } catch (err) {
    console.error("Error fetching category banners from Firestore:", err);
    return null;
  }
};

export const saveCategoryBannersDB = async (config: CategoryBannersConfig) => {
  try {
    await setDoc(doc(db, "settings", "category_banners"), config);
  } catch (err) {
    console.error("Error saving category banners to Firestore:", err);
  }
};

export const savePopularCategoryToDB = async (category: PopularCategoryItem) => {
  try {
    const cId = category.id || `popcat-${Date.now()}`;
    await setDoc(doc(db, "popular_categories", cId), { ...category, id: cId });
  } catch (err) {
    console.error("Error saving popular category to Firestore:", err);
  }
};

export const deletePopularCategoryFromDB = async (id: string) => {
  try {
    await deleteDoc(doc(db, "popular_categories", id));
  } catch (err) {
    console.error("Error deleting popular category from Firestore:", err);
  }
};

export interface MasterclassRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  requestedDate: string;
  skillLevel: string;
  goals: string;
  status: "New" | "In Review" | "Confirmed" | "Completed" | "Cancelled";
  date: string; // the date the masterclass was requested
  createdAt: string; // ISO string of when requested
}

export interface TutorialItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
  videoUrl: string;
  active: boolean;
  order: number;
}

export const saveMasterclassRequestToDB = async (request: MasterclassRequest) => {
  try {
    await setDoc(doc(db, "masterclass_requests", request.id), request, { merge: true });
  } catch (err) {
    console.error("Error saving masterclass request to Firestore:", err);
  }
};

export const deleteMasterclassRequestFromDB = async (id: string) => {
  try {
    await deleteDoc(doc(db, "masterclass_requests", id));
  } catch (err) {
    console.error("Error deleting masterclass request from Firestore:", err);
  }
};

export const fetchTutorialsFromDB = async (): Promise<TutorialItem[]> => {
  try {
    const snap = await getDocs(collection(db, "tutorials"));
    if (snap.empty) return [];
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TutorialItem));
  } catch (err) {
    console.error("Error fetching tutorials from Firestore:", err);
    return [];
  }
};

export const saveTutorialToDB = async (tutorial: TutorialItem) => {
  try {
    const tId = tutorial.id || `tut-${Date.now()}`;
    await setDoc(doc(db, "tutorials", tId), { ...tutorial, id: tId });
  } catch (err) {
    console.error("Error saving tutorial to Firestore:", err);
  }
};

export const deleteTutorialFromDB = async (id: string) => {
  try {
    await deleteDoc(doc(db, "tutorials", id));
  } catch (err) {
    console.error("Error deleting tutorial from Firestore:", err);
  }
};

