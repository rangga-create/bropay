import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as crypto from 'crypto';

@Injectable()
export class WalletsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection('wallets');
  }

  async findAll(uid: string) {
    const snapshot = await this.collection.where('userId', '==', uid).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ walletId: doc.id, ...doc.data() }));
  }

  async findOne(walletId: string) {
    const doc = await this.collection.doc(walletId).get();
    if (!doc.exists) return null;
    return { walletId: doc.id, ...doc.data() };
  }

  async create(uid: string, data: any) {
    const walletId = crypto.randomUUID();
    const wallet = {
      userId: uid,
      name: data.name || 'New Wallet',
      currency: data.currency || 'USD',
      balance: data.balance || 0,
      color: data.color || '#2563EB',
      createdAt: new Date().toISOString(),
    };
    await this.collection.doc(walletId).set(wallet);
    return { walletId, ...wallet };
  }
}
