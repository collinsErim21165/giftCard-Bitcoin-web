// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you're using analytics
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgc4UucaE2ZDRZMJCCJG2tMW_r0EQI4V4",
  authDomain: "sell-giftcard-bitcoin.firebaseapp.com",
  projectId: "sell-giftcard-bitcoin",
  storageBucket: "sell-giftcard-bitcoin.appspot.com",
  messagingSenderId: "54724809272",
  appId: "1:54724809272:web:13c8ea02a3d3dc5eec8ccd",
  measurementId: "G-6HCM4HKVR7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and set session persistence
const auth = getAuth(app);

setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Error setting persistence: ", error);
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, ref, uploadBytes, uploadBytesResumable, getDownloadURL };