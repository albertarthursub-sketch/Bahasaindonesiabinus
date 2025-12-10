import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBqV7Yr8nBGUKJaMXaQuFRfLSdqrNWQGHA",
  authDomain: "bahasa-indonesia-73d67.firebaseapp.com",
  projectId: "bahasa-indonesia-73d67",
  storageBucket: "bahasa-indonesia-73d67.appspot.com",
  messagingSenderId: "866411238944",
  appId: "1:866411238944:web:1dc95e3f3b0e1e8c4cb1a8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
