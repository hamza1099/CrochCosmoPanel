import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Replace with your actual Firebase project credentials from console.firebase.google.com
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBIpRs20fov6-BF3urlkVVxsPNDomfF2qQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crochetcomso.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crochetcomso",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crochetcomso.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "370920891701",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:370920891701:web:ba88f1bfa58ada325f587c"
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
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
  imageUrl: string; // Primary Main Pic
  images?: string[]; // Gallery Pictures (Pic 1, Pic 2, Pic 3)
  description?: string; // Product Description
  colors?: string[]; // Color Options (e.g. Beige, Oatmeal, Sage)
  sizes?: string[]; // Size Options (e.g. 0-3M, 3-6M, 6-12M)
  allowPersonalization?: boolean; // Hand Embroidery Personalization
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

// Initial Mock Data for Immediate Preview
export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "baby-sweater-1",
    name: "Artisanal Organic Baby Sweater",
    category: "Baby Apparel",
    yarnType: "Organic Wool",
    priceUSD: 55.00,
    rating: 4.9,
    badge: "Organic Wool",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Handcrafted with love by our collective of women artisans. Made from 100% locally sourced organic wool, this sweater is incredibly soft, breathable, and designed to gently embrace your little one.",
    colors: ["Beige", "Oatmeal", "Sage"],
    sizes: ["0-3M", "3-6M", "6-12M"],
    allowPersonalization: true,
    stockQuantity: 25,
    inStock: true
  },
  {
    id: "fw-1",
    name: "Hooded Dark Chocolate Patchwork Cardigan",
    category: "Women's Fashion",
    yarnType: "Organic Wool",
    priceUSD: 185.00,
    rating: 5.0,
    badge: "Women's Collection",
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Luxury slow fashion patchwork cardigan crafted with dark chocolate merino yarn.",
    colors: ["Dark Chocolate", "Oatmeal"],
    sizes: ["S", "M", "L", "XL"],
    allowPersonalization: true,
    stockQuantity: 14,
    inStock: true
  },
  {
    id: "fw-2",
    name: "Puffy Daisy Hand-Knitted Sweater",
    category: "Women's Fashion",
    yarnType: "Merino Blend",
    priceUSD: 130.00,
    rating: 5.0,
    badge: "Women's Collection",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
    ],
    description: "3D textured raised stitch flower design with ultra soft feel.",
    colors: ["Cream White", "Pastel Pink"],
    sizes: ["S", "M", "L"],
    allowPersonalization: false,
    stockQuantity: 8,
    inStock: true
  }
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "ORD-9821",
    customerName: "Ayesha Khan",
    email: "ayesha.k@example.com",
    phone: "+92 300 9876543",
    totalUSD: 185.00,
    totalPKR: 51800,
    currency: "PKR",
    status: "Processing",
    paymentMethod: "Cash on Delivery",
    date: "2026-08-18",
    itemsCount: 1
  },
  {
    id: "ORD-9820",
    customerName: "Eleanor Vance",
    email: "eleanor@example.com",
    phone: "+1 415 555 0192",
    totalUSD: 250.00,
    totalPKR: 70000,
    currency: "USD",
    status: "Shipped",
    paymentMethod: "Card",
    date: "2026-08-17",
    itemsCount: 2
  }
];

export const INITIAL_INQUIRIES: CustomInquiry[] = [
  {
    id: "INQ-401",
    customerName: "Zainab Malik",
    email: "zainab@example.com",
    itemType: "Custom Heirloom Baby Blanket",
    specs: "Sage green border with cream centre and initials ZM embroidered.",
    status: "New",
    date: "2026-08-18"
  },
  {
    id: "INQ-400",
    customerName: "Tariq Mahmood",
    email: "tariq@example.com",
    itemType: "Custom Adult Cardigan",
    specs: "Dark walnut brown merino blend with oversized brass buttons.",
    status: "Quoted",
    estimatedPriceUSD: 210.00,
    date: "2026-08-16"
  }
];

export const INITIAL_ARTISANS: Artisan[] = [
  {
    id: "artisan-zainab",
    name: "Zainab Bibi",
    role: "Master Crochet Artisan — 14 Years Experience",
    bio: "Zainab leads our village guild, specializing in delicate heirloom baby blankets and lace cardigans.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    yearsExperience: 14
  },
  {
    id: "artisan-fatima",
    name: "Fatima Noor",
    role: "Amigurumi & Toy Sculptor — 8 Years Experience",
    bio: "Fatima turns pure organic cotton yarn into whimsical amigurumi animals.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    yearsExperience: 8
  }
];

