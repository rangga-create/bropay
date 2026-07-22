import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get transactionsCollection() {
    return this.firebaseService.getFirestore().collection('transactions');
  }

  private async getTransactions(uid: string) {
    const snapshot = await this.transactionsCollection.where('userId', '==', uid).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
  }

  async summary(uid: string) {
    const transactions = await this.getTransactions(uid);
    const income = transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
    const expense = transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);
    const balance = income - expense;
    return { balance, income, expense, transactions };
  }

  async categories(uid: string) {
    const transactions = await this.getTransactions(uid);
    const grouped = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce<Record<string, number>>((acc, tx) => {
        acc[tx.category || 'General'] = (acc[tx.category || 'General'] || 0) + Number(tx.amount);
        return acc;
      }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }

  async monthly(uid: string) {
    const transactions = await this.getTransactions(uid);
    const monthly = transactions.reduce<Record<string, { income: number; expense: number }>>((acc, tx) => {
      const month = new Date(tx.date).toLocaleString('en-US', { month: 'short' });
      acc[month] = acc[month] || { income: 0, expense: 0 };
      if (tx.type === 'income') acc[month].income += Number(tx.amount);
      if (tx.type === 'expense') acc[month].expense += Number(tx.amount);
      return acc;
    }, {});
    return Object.entries(monthly).map(([month, value]) => ({ month, ...value }));
  }
}
