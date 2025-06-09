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
  apiKey: "AIzaSyCBkjx5slHDDqyaHLHugY7kqQAbh3ASaTE",
  authDomain: "gu-chat-3e33d.firebaseapp.com",
  databaseURL: "https://gu-chat-3e33d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gu-chat-3e33d",
  storageBucket: "gu-chat-3e33d.firebasestorage.app",
  messagingSenderId: "275413272612",
  appId: "1:275413272612:web:983824d1865e228cf6b0b1",
  measurementId: "G-SKRFBYPCHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, "chat-app");
const chatDatabase = getDatabase(app);
const chatStorage = getStorage(app);
// const analytics = getAnalytics(app);

export { chatDatabase, chatStorage };
export default app;