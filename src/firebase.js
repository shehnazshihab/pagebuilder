import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAORb86557UWdv2PJyGz4gV37ADAOnKBtU",
    authDomain: "dynamic-page-builder-b921f.firebaseapp.com",
    projectId: "dynamic-page-builder-b921f",
    storageBucket: "dynamic-page-builder-b921f.appspot.com",
    messagingSenderId: "68603700453",
    appId: "1:68603700453:web:b103b7e78a609ea26e600c",
    measurementId: "G-3C9PW9L3EE"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, setDoc, getDoc };
