import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJZtFcoRqfC4R376w9e60dwitqLUL_NBs",
  authDomain: "business-management-e6ce9.firebaseapp.com",
  projectId: "business-management-e6ce9",
  storageBucket: "business-management-e6ce9.firebasestorage.app",
  messagingSenderId: "483418455510",
  appId: "1:483418455510:web:113d684f33dc9bb8fc7877"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence using new API
export const db = initializeFirestore(app, {
  cache: memoryLocalCache()
});

export default app;
