import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMTCeb2-hkxcACW06xa8sAP0dRbRkqbvI",
  authDomain: "pdfai-summary.firebaseapp.com",
  projectId: "pdfai-summary",
  storageBucket: "pdfai-summary.appspot.com",
  messagingSenderId: "152940432077",
  appId: "1:152940432077:web:681d2e8b16c7960d077784",
  measurementId: "G-85XKYYHE2H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const firestore = getFirestore(app); // Change this line to getFirestore instead of getDatabase
export const storage = getStorage(app);
const analytics = getAnalytics(app);
export default app;
export { firestore };
