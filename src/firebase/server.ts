
import { initializeApp, getApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// IMPORTANT: Do not use this file on the client-side.
// It is intended for server-side use only (e.g., in Server Actions, API routes).

const appName = 'firebase-admin-app';

export function initializeFirebase() {
  // Check if app already exists
  const existingApp = getApps().find(app => app.name === appName);
  if (existingApp) {
    return getSdks(existingApp);
  }

  // Validate environment variable
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. ' +
      'Please add it to your .env.local file. ' +
      'You can get this from Firebase Console > Project Settings > Service Accounts > Generate New Private Key'
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (error) {
    throw new Error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. ' +
      'Make sure it is valid JSON format. Error: ' + 
      (error instanceof Error ? error.message : 'Unknown error')
    );
  }

  // Initialize Firebase Admin
  const newApp = initializeApp({
    credential: cert(serviceAccount)
  }, appName);

  console.log('✅ Firebase Admin SDK initialized successfully');

  return getSdks(newApp);
}

function getSdks(app: App) {
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
