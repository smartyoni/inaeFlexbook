import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

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

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.log('The current browser does not support all of the features required to enable persistence');
  }
});

export default app;
