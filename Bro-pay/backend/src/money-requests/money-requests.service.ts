import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as crypto from 'crypto';

@Injectable()
export class MoneyRequestsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection('moneyRequests');
  }

  async findAll(uid: string) {
    const snapshot = await this.collection
      .where('fromUserId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    const toSnapshot = await this.collection
      .where('toUserId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const from = snapshot.docs.map((doc) => ({ requestId: doc.id, ...doc.data() }));
    const to = toSnapshot.docs.map((doc) => ({ requestId: doc.id, ...doc.data() }));

    const all = [...from, ...to];
    all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all;
  }

  async create(uid: string, data: any) {
    const requestId = crypto.randomUUID();
    const request = {
      fromUserId: uid,
      toUserId: data.toUserId || '',
      amount: Number(data.amount) || 0,
      reason: data.reason || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await this.collection.doc(requestId).set(request);
    return { requestId, ...request };
  }

  async accept(uid: string, requestId: string) {
    await this.updateStatus(requestId, 'accepted', uid, 'toUserId');
    return { success: true };
  }

  async decline(uid: string, requestId: string) {
    await this.updateStatus(requestId, 'declined', uid, 'toUserId');
    return { success: true };
  }

  private async updateStatus(requestId: string, status: string, uid: string, field: string) {
    const doc = this.collection.doc(requestId);
    const snap = await doc.get();
    if (snap.exists && snap.data()?.[field] === uid) {
      await doc.update({ status });
    }
  }
}
