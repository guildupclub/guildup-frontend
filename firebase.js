// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional



// we will be moving these to env variables in the future
const firebaseConfig = {
  apiKey: "AIzaSyBWO_AMsoEqsdbveiCWSl70FFKkjji9oOo",
  authDomain: "guildup-chat.firebaseapp.com",
  databaseURL: "https://guildup-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "guildup-chat",
  storageBucket: "guildup-chat.firebasestorage.app",
  messagingSenderId: "699570993375",
  appId: "1:699570993375:web:4dcc3384fb1b11cbc0d16a",
  measurementId: "G-K3MP5CS23M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;
