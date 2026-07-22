import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as crypto from 'crypto';

@Injectable()
export class TransactionsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection('transactions');
  }

  async findAll(uid: string, query?: any) {
    let ref: any = this.collection.where('userId', '==', uid);

    if (query?.type && query.type !== 'all') {
      ref = ref.where('type', '==', query.type);
    }

    ref = ref.orderBy('createdAt', 'desc');

    const limit = query?.limit ? Number(query.limit) : 10;
    const page = query?.page ? Number(query.page) : 1;

    let snapshot;
    if (query?.search) {
      const allDocs = await ref.get();
      const filtered = allDocs.docs
        .map((doc) => ({ transactionId: doc.id, ...doc.data() }))
        .filter((t: any) => t.name?.toLowerCase().includes(query.search.toLowerCase()));
      const total = filtered.length;
      const start = (page - 1) * limit;
      const transactions = filtered.slice(start, start + limit);
      return { transactions, total, page, totalPages: Math.ceil(total / limit) };
    }

    snapshot = await ref.limit(limit).get();
    const allSnapshot = await this.collection.where('userId', '==', uid).count().get();
    const total = allSnapshot.data().count || 0;

    const transactions = snapshot.docs.map((doc) => ({ transactionId: doc.id, ...doc.data() }));
    return { transactions, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(uid: string, transactionId: string) {
    const doc = await this.collection.doc(transactionId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (data.userId !== uid) return null;
    return { transactionId: doc.id, ...data };
  }

  async create(uid: string, data: any) {
    const transactionId = crypto.randomUUID();
    const transaction = {
      userId: uid,
      name: data.name,
      type: data.type,
      amount: Number(data.amount),
      category: data.category || 'General',
      note: data.note || '',
      status: 'completed',
      date: data.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    await this.collection.doc(transactionId).set(transaction);

    const walletsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('wallets')
      .where('userId', '==', uid)
      .limit(1)
      .get();

    let balance = 0;
    if (!walletsSnapshot.empty) {
      const walletDoc = walletsSnapshot.docs[0];
      const wallet = walletDoc.data();
      const change = data.type === 'income' ? Number(data.amount) : -Number(data.amount);
      balance = Number(wallet.balance) + change;
      await walletDoc.ref.update({ balance });
    }

    return { transactionId, ...transaction };
  }
}
