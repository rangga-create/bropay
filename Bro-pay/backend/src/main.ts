import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FirebaseService } from './firebase/firebase.service';

async function seedData(firebaseService: FirebaseService) {
  const firestore = firebaseService.getFirestore();
  const auth = firebaseService.getAuth();
  if (!firestore) {
    console.error('Firestore is not initialized. Skipping seed. Check FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env or set GOOGLE_APPLICATION_CREDENTIALS to a valid service account JSON.');
    return;
  }

  if (!auth) {
    console.error('Firebase Auth is not initialized. Skipping seed. Check Firebase Admin SDK credentials.');
    return;
  }

  const existingUserSnapshot = await firestore.collection('users').where('email', '==', 'bro@example.com').limit(1).get();
  if (!existingUserSnapshot.empty) return;

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail('bro@example.com');
  } catch {
    userRecord = await auth.createUser({
      email: 'bro@example.com',
      password: 'password',
      displayName: 'John Doe',
    });
  }

  const uid = userRecord.uid;
  const now = new Date().toISOString();
  const userData = {
    uid,
    name: 'John Doe',
    email: 'bro@example.com',
    phone: '',
    avatar: '',
    memberSince: 'January 2024',
    createdAt: now,
    updatedAt: now,
  };

  await firestore.collection('users').doc(uid).set(userData);

  const secondUserEmail = 'jane@example.com';
  let secondUserRecord;
  try {
    secondUserRecord = await auth.getUserByEmail(secondUserEmail);
  } catch {
    secondUserRecord = await auth.createUser({
      email: secondUserEmail,
      password: 'password123',
      displayName: 'Jane Doe',
    });
  }

  const uid2 = secondUserRecord.uid;
  const secondUserData = {
    uid: uid2,
    name: 'Jane Doe',
    email: secondUserEmail,
    phone: '+1 555 987 6543',
    avatar: '',
    memberSince: 'February 2025',
    createdAt: now,
    updatedAt: now,
  };

  await firestore.collection('users').doc(uid2).set(secondUserData);

  const wallets = [
    { name: 'Main Balance', currency: 'USD', balance: 12450.0, color: '#2563EB' },
    { name: 'Savings', currency: 'USD', balance: 5420.5, color: '#10B981' },
    { name: 'Travel Fund', currency: 'EUR', balance: 1200.0, color: '#F59E0B' },
  ];

  const transactions = [
    { name: 'Netflix Subscription', type: 'expense', amount: 15.99, category: 'Entertainment', note: 'Monthly subscription', status: 'completed', date: '2026-07-20' },
    { name: 'Salary Deposit', type: 'income', amount: 4500.0, category: 'Salary', note: 'Monthly salary', status: 'completed', date: '2026-07-19' },
    { name: 'Coffee Shop', type: 'expense', amount: 4.5, category: 'Food', note: 'Morning coffee', status: 'completed', date: '2026-07-18' },
    { name: 'Freelance Payment', type: 'income', amount: 350.0, category: 'Freelance', note: 'Design project', status: 'completed', date: '2026-07-17' },
    { name: 'Grocery Shopping', type: 'expense', amount: 82.75, category: 'Groceries', note: 'Weekly groceries', status: 'completed', date: '2026-07-16' },
  ];

  const notifications = [
    { title: 'Welcome', message: 'Your account is ready', read: false, type: 'system' },
    { title: 'Payment Received', message: 'You received $350 from freelance work', read: false, type: 'transaction' },
  ];

  const activities = [
    { type: 'login', title: 'Login Successful', description: 'Signed in from your device', ip: '127.0.0.1' },
    { type: 'settings', title: 'Profile Updated', description: 'Updated contact details', ip: '127.0.0.1' },
  ];

  const budgets = [
    { name: 'Monthly Bills', allocated: 1200.0, spent: 620.25, icon: 'wallet', color: '#2563EB' },
    { name: 'Travel', allocated: 800.0, spent: 150.0, icon: 'plane', color: '#F59E0B' },
  ];

  const goals = [
    { name: 'Emergency Fund', targetAmount: 5000.0, currentAmount: 1550.0, deadline: '2026-12-31', icon: 'shield', color: '#10B981' },
    { name: 'New Laptop', targetAmount: 1800.0, currentAmount: 400.0, deadline: '2027-06-30', icon: 'laptop', color: '#8B5CF6' },
  ];

  const splitBills = [
    {
      creatorId: uid,
      title: 'Dinner at The Bistro',
      totalAmount: 120.0,
      participants: [
        { userId: uid, name: 'John Doe', amount: 40.0, paid: true },
        { userId: uid2, name: 'Jane Doe', amount: 40.0, paid: false },
        { userId: 'guest', name: 'Mark', amount: 40.0, paid: false },
      ],
      status: 'pending',
      createdAt: now,
    },
  ];

  const moneyRequests = [
    { fromUserId: uid2, toUserId: uid, amount: 75.0, reason: 'Dinner split', status: 'pending', createdAt: now },
    { fromUserId: uid, toUserId: uid2, amount: 120.0, reason: 'Travel advance', status: 'accepted', createdAt: now },
  ];

  const analytics = [
    { userId: uid, type: 'summary', period: 'monthly', totalIncome: 4850.0, totalExpense: 123.24, createdAt: now },
    { userId: uid, type: 'categories', period: 'monthly', categories: { Food: 87.25, Entertainment: 15.99 }, createdAt: now },
    { userId: uid, type: 'monthly', month: 'July', year: 2026, income: 4850.0, expense: 123.24, createdAt: now },
  ];

  const settings = {
    userId: uid,
    language: 'English',
    darkMode: true,
    notification: true,
    security: {},
  };

  const promises = [];
  wallets.forEach((wallet) => {
    promises.push(
      firestore.collection('wallets').doc().set({ userId: uid, ...wallet, createdAt: now }),
    );
  });

  transactions.forEach((transaction) => {
    promises.push(
      firestore.collection('transactions').doc().set({ userId: uid, ...transaction, createdAt: now }),
    );
  });

  notifications.forEach((notification) => {
    promises.push(
      firestore.collection('notifications').doc().set({ userId: uid, ...notification, createdAt: now }),
    );
  });

  activities.forEach((activity) => {
    promises.push(
      firestore.collection('activities').doc().set({ userId: uid, ...activity, createdAt: now }),
    );
  });

  budgets.forEach((budget) => {
    promises.push(
      firestore.collection('budgets').doc().set({ userId: uid, ...budget, createdAt: now }),
    );
  });

  goals.forEach((goal) => {
    promises.push(
      firestore.collection('goals').doc().set({ userId: uid, ...goal, createdAt: now }),
    );
  });

  splitBills.forEach((splitBill) => {
    promises.push(
      firestore.collection('splitBills').doc().set({ ...splitBill }),
    );
  });

  moneyRequests.forEach((request) => {
    promises.push(
      firestore.collection('moneyRequests').doc().set({ ...request }),
    );
  });

  analytics.forEach((entry) => {
    promises.push(
      firestore.collection('analytics').doc().set({ ...entry }),
    );
  });

  promises.push(firestore.collection('settings').doc(uid).set(settings));
  await Promise.all(promises);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const firebaseService = app.get(FirebaseService);
  // Wait for FirebaseService to initialize (onModuleInit) before seeding
  const waitForFirebase = async (timeoutMs = 10000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (firebaseService.getFirestore() && firebaseService.getAuth()) return;
      // sleep 500ms
      await new Promise((r) => setTimeout(r, 500));
    }
    console.warn('Timed out waiting for FirebaseService to initialize; proceeding without seeding.');
  };

  await waitForFirebase();
  await seedData(firebaseService);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
