// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADv3DasVk8Jvpdkz_hUZa-PeODDuz9HWM", // From your project info
  authDomain: "angularis-dda67.firebaseapp.com",
  projectId: "angularis-dda67", // From your project ID
  storageBucket: "angularis-dda67.appspot.com",
  messagingSenderId: "419983669614", // From your project number
  appId: "1:419983669614:web:a87c24a1b9591e55f75b42" // Fixed app ID
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 