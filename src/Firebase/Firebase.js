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
    apiKey: "AIzaSyDXXhTj4ne-cL4m5MOh-IwD-7yX32-ATec",
    authDomain: "gptsummaryapp.firebaseapp.com",
    projectId: "gptsummaryapp",
    storageBucket: "gptsummaryapp.appspot.com",
    messagingSenderId: "80945253235",
    appId: "1:80945253235:web:d8ac3ca08ebe3514b01306",
    measurementId: "G-P55TK3VZDY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const firestore = getFirestore(app); // Change this line to getFirestore instead of getDatabase
export const storage = getStorage(app);
export default app;
export { firestore };