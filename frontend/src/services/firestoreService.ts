import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { firestoreDb } from "./firebase";

export interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: any;
  lastLogin: any;
}

export interface FirestoreInterviewResult {
  id?: string;
  uid: string;
  username: string;
  email: string;
  interviewDomain: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: string;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  interviewDate: string;
  interviewDuration: string;
  createdAt: any;
}

/**
 * Save or update user profile document in Firestore 'users' collection
 */
export async function saveUserToFirestore(user: {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
}) {
  if (!user || !user.uid) return;
  try {
    const userRef = doc(firestoreDb, "users", user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        name: user.name || "Candidate",
        email: user.email || "",
        photoURL: user.photoURL || "",
        lastLogin: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("[Firestore] saveUserToFirestore notice:", error);
  }
}

/**
 * Automatically store a new completed interview document into 'interview_results' collection
 */
export async function saveInterviewResultToFirestore(resultData: {
  uid: string;
  username: string;
  email: string;
  interviewDomain: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: string;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  interviewDate: string;
  interviewDuration: string;
}) {
  try {
    const collectionRef = collection(firestoreDb, "interview_results");
    const docRef = await addDoc(collectionRef, {
      ...resultData,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    console.log("🔥 [Firestore] Interview result saved document ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.warn("[Firestore] saveInterviewResultToFirestore notice:", error);
    return null;
  }
}

/**
 * Fetch all registered users for Admin Dashboard
 */
export async function getAllUsersFromFirestore(): Promise<FirestoreUser[]> {
  try {
    const usersCol = collection(firestoreDb, "users");
    const snapshot = await getDocs(usersCol);
    const usersList: FirestoreUser[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      usersList.push({
        uid: docSnap.id,
        name: data.name || "Candidate",
        email: data.email || "",
        photoURL: data.photoURL || "",
        createdAt: data.createdAt || data.lastLogin || new Date().toISOString(),
        lastLogin: data.lastLogin || new Date().toISOString(),
      });
    });
    return usersList;
  } catch (error) {
    console.warn("[Firestore] getAllUsersFromFirestore notice:", error);
    return [];
  }
}

/**
 * Fetch all interview results across all candidates for Admin Dashboard
 */
export async function getAllInterviewsFromFirestore(): Promise<FirestoreInterviewResult[]> {
  try {
    const colRef = collection(firestoreDb, "interview_results");
    const snapshot = await getDocs(colRef);
    const list: FirestoreInterviewResult[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        uid: data.uid || "user_unknown",
        username: data.username || "Candidate",
        email: data.email || "",
        interviewDomain: data.interviewDomain || "Software Engineer",
        difficulty: data.difficulty || "Standard",
        totalQuestions: Number(data.totalQuestions) || 5,
        correctAnswers: Number(data.correctAnswers) || 4,
        score: Number(data.score) || 85,
        percentage: data.percentage || `${data.score || 85}%`,
        overallFeedback: data.overallFeedback || "Good overall response.",
        strengths: Array.isArray(data.strengths) ? data.strengths : ["Technical Communication"],
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : ["Deep metrics elaboration"],
        interviewDate: data.interviewDate || new Date().toLocaleDateString(),
        interviewDuration: data.interviewDuration || "5 mins",
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return list;
  } catch (error) {
    console.warn("[Firestore] getAllInterviewsFromFirestore notice:", error);
    return [];
  }
}

/**
 * Fetch only the logged-in user's own interview history for 'My Interview History'
 */
export async function getUserInterviewsFromFirestore(userUid: string): Promise<FirestoreInterviewResult[]> {
  if (!userUid) return [];
  try {
    const colRef = collection(firestoreDb, "interview_results");
    const q = query(colRef, where("uid", "==", userUid));
    const snapshot = await getDocs(q);
    const list: FirestoreInterviewResult[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        uid: data.uid || userUid,
        username: data.username || "Candidate",
        email: data.email || "",
        interviewDomain: data.interviewDomain || "Software Engineer",
        difficulty: data.difficulty || "Standard",
        totalQuestions: Number(data.totalQuestions) || 5,
        correctAnswers: Number(data.correctAnswers) || 4,
        score: Number(data.score) || 85,
        percentage: data.percentage || `${data.score || 85}%`,
        overallFeedback: data.overallFeedback || "Good overall response.",
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
        interviewDate: data.interviewDate || new Date().toLocaleDateString(),
        interviewDuration: data.interviewDuration || "5 mins",
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return list;
  } catch (error) {
    console.warn("[Firestore] getUserInterviewsFromFirestore notice:", error);
    return [];
  }
}
