import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWswjh801ZPdVJIBSrc2iTct4ZGeAHy8A",
  authDomain: "rika-1.firebaseapp.com",
  projectId: "rika-1",
  storageBucket: "rika-1.appspot.com",
  messagingSenderId: "318737227763",
  appId: "1:318737227763:web:543389b24bf97714ba3c86",
  measurementId: "G-86KELKS01J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const firestore = getFirestore(app); // Change this line to getFirestore instead of getDatabase
export const storage = getStorage(app);
export default app;
export { firestore };
