import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with long-polling to bypass potential firewall/websocket issues
// Using getFirestore with databaseId if it exists in config
const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, databaseId);

export const auth = getAuth(app);

// Connection test as per guidelines
async function testConnection() {
  try {
    // Attempting to read a non-existent document will still test the connection
    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
    console.log("Firestore connection successful.");
  } catch (error: any) {
    if (error.message && error.message.includes('offline')) {
      console.error("Firestore appears to be offline. Check configuration.", error);
    } else {
      console.warn("Firestore connection check finished (any error here besides 'offline' confirms connection capability).", error.message);
    }
  }
}
testConnection();
