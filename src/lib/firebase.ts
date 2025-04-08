import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-zsDPKpFZ1pxJyw9AeUe7RX2MdMo2u9A",
  authDomain: "webdemo-47ff9.firebaseapp.com",
  projectId: "webdemo-47ff9",
  storageBucket: "webdemo-47ff9.firebasestorage.app",
  messagingSenderId: "523782976481",
  appId: "1:523782976481:web:8abac7c6510ece6f57d8a0",
  measurementId: "G-HDN4JX4HVX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };