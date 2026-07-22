import { Injectable, OnModuleInit } from '@nestjs/common';
// Use require to avoid ESM/CJS interop issues at runtime
const adminImport = require('firebase-admin');
const admin: any = (adminImport as any)?.default ?? adminImport;

@Injectable()
export class FirebaseService implements OnModuleInit {
  // Use `any` here to avoid fragile firebase-admin type mismatches
  public auth: any;
  public firestore: any;
  public storage: any;

  onModuleInit() {
    const adm: any = admin as any;
    console.log('Firebase admin keys:', adm && Object.keys(adm));
    console.log('admin.credential exists?', !!(adm && adm.credential));
    try {
      if (!adm.apps || !adm.apps.length) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.FIREBASE_PROJECT_ID;

        const certFn = adm.credential?.cert ?? adm.cert;
        const appDefaultFn = adm.credential?.applicationDefault ?? adm.applicationDefault;

        const credential = privateKey && clientEmail && projectId
          ? certFn({ projectId, clientEmail, privateKey })
          : appDefaultFn && appDefaultFn();

        const app = adm.initializeApp({
          credential,
          projectId,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });

        // Use modular subpackages to obtain services (works across admin SDK shapes)
        const authModule = require('firebase-admin/auth');
        const firestoreModule = require('firebase-admin/firestore');
        const storageModule = require('firebase-admin/storage');

        this.auth = (authModule && authModule.getAuth) ? authModule.getAuth(app) : (typeof adm.auth === 'function' ? adm.auth() : (typeof adm.getAuth === 'function' ? adm.getAuth() : undefined));
        this.firestore = (firestoreModule && firestoreModule.getFirestore) ? firestoreModule.getFirestore(app) : (typeof adm.firestore === 'function' ? adm.firestore() : (typeof adm.getFirestore === 'function' ? adm.getFirestore() : undefined));
        this.storage = (storageModule && storageModule.getStorage) ? storageModule.getStorage(app) : (typeof adm.storage === 'function' ? adm.storage() : (typeof adm.getStorage === 'function' ? adm.getStorage() : undefined));
        console.log('Initialized firebase admin via modular APIs. auth?', !!this.auth, 'firestore?', !!this.firestore, 'storage?', !!this.storage);
      }
    } catch (err) {
      console.error('Failed to initialize Firebase Admin SDK. Check FIREBASE_ env vars or service account:', err?.message || err);
      this.auth = undefined;
      this.firestore = undefined;
      this.storage = undefined;
    }
  }

  getFirestore() {
    return this.firestore;
  }

  getAuth() {
    return this.auth;
  }

  getStorage() {
    return this.storage;
  }
}
