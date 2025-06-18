// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUmWxoCjotsy7kBKA5z7-EtELx4ckFbxg",
  authDomain: "gu-chat-34eac.firebaseapp.com",
  databaseURL: "https://gu-chat-34eac-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gu-chat-34eac",
  storageBucket: "gu-chat-34eac.firebasestorage.app",
  messagingSenderId: "856901847244",
  appId: "1:856901847244:web:2f1fb4fafc6eacc51ada69",
  measurementId: "G-LRMPL5VB7L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, "chat-app");
const chatDatabase = getDatabase(app);
const chatStorage = getStorage(app);
// const analytics = getAnalytics(app);

export { chatDatabase, chatStorage };
export default app;
