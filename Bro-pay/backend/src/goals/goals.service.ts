import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as crypto from 'crypto';

@Injectable()
export class GoalsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection('goals');
  }

  async findAll(uid: string) {
    const snapshot = await this.collection.where('userId', '==', uid).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ goalId: doc.id, ...doc.data() }));
  }

  async create(uid: string, data: any) {
    const goalId = crypto.randomUUID();
    const goal = {
      userId: uid,
      name: data.name || 'New Goal',
      targetAmount: Number(data.targetAmount) || 0,
      currentAmount: Number(data.currentAmount) || 0,
      deadline: data.deadline || '',
      icon: data.icon || '',
      color: data.color || '#8B5CF6',
      createdAt: new Date().toISOString(),
    };
    await this.collection.doc(goalId).set(goal);
    return { goalId, ...goal };
  }

  async update(uid: string, goalId: string, data: any) {
    const doc = this.collection.doc(goalId);
    const snap = await doc.get();
    if (!snap.exists || snap.data()?.userId !== uid) return null;
    await doc.update(data);
    const updated = await doc.get();
    return { goalId: updated.id, ...updated.data() };
  }

  async delete(uid: string, goalId: string) {
    const doc = this.collection.doc(goalId);
    const snap = await doc.get();
    if (snap.exists && snap.data()?.userId === uid) {
      await doc.delete();
    }
    return { success: true };
  }
}
