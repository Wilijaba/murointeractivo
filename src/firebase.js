// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbKPAMVQtAO31KdSM_CyoLnv03KxtNyR0",
  authDomain: "final-web-project-2917f.firebaseapp.com",
  projectId: "final-web-project-2917f",
  storageBucket: "final-web-project-2917f.firebasestorage.app",
  messagingSenderId: "997292507536",
  appId: "1:997292507536:web:1010e6d5ed674091947315",
  measurementId: "G-KC1SK87B7R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);