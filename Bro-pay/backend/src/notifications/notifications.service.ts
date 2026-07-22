import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection('notifications');
  }

  async findAll(uid: string) {
    const snapshot = await this.collection.where('userId', '==', uid).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ notificationId: doc.id, ...doc.data() }));
  }

  async unreadCount(uid: string) {
    const snapshot = await this.collection.where('userId', '==', uid).where('read', '==', false).count().get();
    return { count: snapshot.data().count || 0 };
  }

  async markRead(uid: string, notificationId: string) {
    const doc = this.collection.doc(notificationId);
    const snap = await doc.get();
    if (snap.exists && snap.data()?.userId === uid) {
      await doc.update({ read: true });
    }
    return { success: true };
  }

  async delete(uid: string, notificationId: string) {
    const doc = this.collection.doc(notificationId);
    const snap = await doc.get();
    if (snap.exists && snap.data()?.userId === uid) {
      await doc.delete();
    }
    return { success: true };
  }
}
