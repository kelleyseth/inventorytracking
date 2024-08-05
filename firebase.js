// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANTL5g4A0DKP0F08QQ-YgIKULdGzxOJfI",
  authDomain: "pantry-tracker-227d1.firebaseapp.com",
  projectId: "pantry-tracker-227d1",
  storageBucket: "pantry-tracker-227d1.appspot.com",
  messagingSenderId: "182764701521",
  appId: "1:182764701521:web:cdffcb73edd65a22e5f570",
  measurementId: "G-04MFFXYD08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };