import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBNomTnOwzQN1hcr4zKRiByc2RMZWORRAo',
  authDomain: 'bropay-5741c.firebaseapp.com',
  projectId: 'bropay-5741c',
  storageBucket: 'bropay-5741c.firebasestorage.app',
  messagingSenderId: '950102507462',
  appId: '1:950102507462:web:1ae9cf26f0128dff80bcc7',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const storage = getStorage(app)

export { app, auth, storage }
