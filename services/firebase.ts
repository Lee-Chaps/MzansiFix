
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { User, IssueReport } from "../types";

// ------------------------------------------------------------------
// ⚠️ CRITICAL: REPLACE THIS CONFIG WITH YOUR OWN FIREBASE KEYS ⚠️
// Go to Firebase Console -> Project Settings -> General -> Your Apps
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyA0V6o-JNIoBgS-3IU4SPrfJ7IjG-OfKSc",
  authDomain: "week-7-62066.firebaseapp.com",
  projectId: "week-7-62066",
  storageBucket: "week-7-62066.firebasestorage.app",
  messagingSenderId: "602428528948",
  appId: "1:602428528948:web:b893bbb03fa4cf620e2d61",
  measurementId: "G-Z6MLBRDB0J"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- Auth Services ---

/**
 * Registers a new user in Firebase Auth and creates a user document in Firestore
 */
export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  try {
    // 1. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Update Display Name in Auth
    await updateProfile(firebaseUser, { displayName: name });

    // 3. Create User Object
    const newUser: User = {
      name: name,
      email: email,
      region: "City of Johannesburg", // Default
    };

    // 4. Save extra details to Firestore (users collection)
    await setDoc(doc(db, "users", firebaseUser.uid), newUser);

    return newUser;
  } catch (error: any) {
    console.error("Registration Error:", error);
    throw mapAuthError(error.code);
  }
};

/**
 * Logs in a user and fetches their profile from Firestore
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    // 1. Sign In
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Fetch Profile from Firestore
    const docRef = doc(db, "users", firebaseUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as User;
    } else {
      // Fallback if firestore doc doesn't exist but auth does
      return {
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email || email,
      };
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    throw mapAuthError(error.code);
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

// --- Report Services ---

/**
 * Saves a report to the 'reports' collection in Firestore
 */
export const saveReport = async (userId: string, report: IssueReport): Promise<void> => {
  try {
    // We use setDoc with the report_id to ensure idempotency (no duplicates)
    await setDoc(doc(db, "reports", report.report_id), {
      ...report,
      userId: userId,
      // Ensure we have a searchable date field if needed by Firestore
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving report to Firestore:", error);
    throw new Error("Failed to save report to database.");
  }
};

/**
 * Fetches all reports for a specific user
 */
export const fetchUserReports = async (userId: string): Promise<IssueReport[]> => {
  try {
    const q = query(
      collection(db, "reports"), 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const reports: IssueReport[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push(doc.data() as IssueReport);
    });

    // Sort by createdAt descending (newest first)
    // We do this client-side to avoid needing a composite index immediately
    return reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
};

// Helper to make Firebase error codes human-readable
const mapAuthError = (code: string): Error => {
  switch (code) {
    case 'auth/email-already-in-use':
      return new Error("This email is already registered.");
    case 'auth/invalid-email':
      return new Error("Please enter a valid email address.");
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return new Error("Invalid email or password.");
    case 'auth/weak-password':
      return new Error("Password should be at least 6 characters.");
    default:
      return new Error("Authentication failed. Please check your configuration.");
  }
};
