import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as crypto from 'crypto';

@Injectable()
export class SplitBillsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection('splitBills');
  }

  async findAll(uid: string) {
    const snapshot = await this.collection.where('creatorId', '==', uid).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ splitBillId: doc.id, ...doc.data() }));
  }

  async create(uid: string, data: any) {
    const splitBillId = crypto.randomUUID();
    const splitBill = {
      creatorId: uid,
      title: data.title || 'Split Bill',
      totalAmount: Number(data.totalAmount) || 0,
      participants: data.participants || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await this.collection.doc(splitBillId).set(splitBill);
    return { splitBillId, ...splitBill };
  }

  async settle(uid: string, splitBillId: string) {
    const doc = this.collection.doc(splitBillId);
    const snap = await doc.get();
    if (snap.exists && snap.data()?.creatorId === uid) {
      await doc.update({ status: 'settled' });
    }
    return { success: true };
  }
}
