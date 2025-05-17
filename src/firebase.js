// Import các function cần thiết từ Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Cấu hình Firebase Web App
const firebaseConfig = {
  apiKey: "AIzaSyCp8-_oTKN4gxlzWTRnVBy-anHqUj9W2RI",
  authDomain: "noise1-86e74.firebaseapp.com",
  databaseURL: "https://noise1-86e74-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "noise1-86e74",
  storageBucket: "noise1-86e74.firebasestorage.app",
  messagingSenderId: "552222598207",
  appId: "1:552222598207:web:54c65a1ccbd62124c8448a"
};


// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Export Realtime Database
export const database = getDatabase(app);
