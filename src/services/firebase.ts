import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBythmtOKjpsdZiQh9zvAGLxtGGGjUFId4",
    authDomain: "anchorguard-ai.firebaseapp.com",
    projectId: "anchorguard-ai",
    storageBucket: "anchorguard-ai.firebasestorage.app",
    messagingSenderId: "978685072776",
    appId: "1:978685072776:web:3b091f98b29dcf2550563d",
    measurementId: "G-XYWYN3JG56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
