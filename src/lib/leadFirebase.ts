import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLqwtI0VteNAL-znfErALEIG_0RgebxLU",
  authDomain: "lead-gen-90201.firebaseapp.com",
  projectId: "lead-gen-90201",
  storageBucket: "lead-gen-90201.firebasestorage.app",
  messagingSenderId: "828149638115",
  appId: "1:828149638115:web:3a998a29039ec7f5e1b6d6",
  measurementId: "G-N5C5W5WS5R",
};

function ensureLeadApp(): FirebaseApp {
  const apps = getApps();
  const existing = apps.find((a) => a.name === "lead-gen-app");
  if (existing) return existing;
  try {
    return getApp("lead-gen-app");
  } catch {
    return initializeApp(firebaseConfig, "lead-gen-app");
  }
}

const app = ensureLeadApp();

export const leadsDb = getFirestore(app);


