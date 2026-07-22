import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';

@Injectable()
export class AppService {
  constructor(private readonly firebaseService: FirebaseService) {}

  getHello(): string {
    return 'Bro Pay API is running!';
  }

  async getDashboard(uid: string) {
    const transactionsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('transactions')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(6)
      .get();

    const walletsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('wallets')
      .where('userId', '==', uid)
      .get();

    const transactions = transactionsSnapshot.docs.map((doc) => ({ transactionId: doc.id, ...doc.data() }));
    const wallets = walletsSnapshot.docs.map((doc) => ({ walletId: doc.id, ...doc.data() }));

    const balance = wallets.reduce((sum: number, w: any) => sum + Number(w.balance), 0);

    let income = 0;
    let expense = 0;

    const allTxSnapshot = await this.firebaseService
      .getFirestore()
      .collection('transactions')
      .where('userId', '==', uid)
      .get();

    allTxSnapshot.docs.forEach((doc) => {
      const tx = doc.data();
      if (tx.type === 'income') income += Number(tx.amount);
      else if (tx.type === 'expense') expense += Number(tx.amount);
    });

    return {
      balance: Number(balance),
      income: Number(income),
      expense: Number(expense),
      transactions,
    };
  }
}
