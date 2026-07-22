import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as crypto from 'crypto';

@Injectable()
export class BudgetsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection('budgets');
  }

  async findAll(uid: string) {
    const snapshot = await this.collection.where('userId', '==', uid).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ budgetId: doc.id, ...doc.data() }));
  }

  async create(uid: string, data: any) {
    const budgetId = crypto.randomUUID();
    const budget = {
      userId: uid,
      name: data.name || 'New Budget',
      allocated: Number(data.allocated) || 0,
      spent: Number(data.spent) || 0,
      icon: data.icon || '',
      color: data.color || '#10B981',
      createdAt: new Date().toISOString(),
    };
    await this.collection.doc(budgetId).set(budget);
    return { budgetId, ...budget };
  }

  async update(uid: string, budgetId: string, data: any) {
    const doc = this.collection.doc(budgetId);
    const snap = await doc.get();
    if (!snap.exists || snap.data()?.userId !== uid) return null;
    await doc.update(data);
    const updated = await doc.get();
    return { budgetId: updated.id, ...updated.data() };
  }

  async delete(uid: string, budgetId: string) {
    const doc = this.collection.doc(budgetId);
    const snap = await doc.get();
    if (snap.exists && snap.data()?.userId === uid) {
      await doc.delete();
    }
    return { success: true };
  }
}
