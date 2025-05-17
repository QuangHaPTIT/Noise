// Import các function cần thiết từ Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Cấu hình Firebase Web App
const firebaseConfig = {
  apiKey: "AIzaSyCBLO53Dumfzna0tGKUum2EOF-IMSUz6DE",
  authDomain: "noise-c49bc.firebaseapp.com",
  databaseURL: "https://noise-c49bc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "noise-c49bc",
  storageBucket: "noise-c49bc.firebasestorage.app",
  messagingSenderId: "516716431214",
  appId: "1:516716431214:web:e2f2ba85f7d8a23465e37f"
};


// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Export Realtime Database
export const database = getDatabase(app);
