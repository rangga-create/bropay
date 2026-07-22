import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class SettingsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection('settings');
  }

  async getSettings(uid: string) {
    const doc = await this.collection.doc(uid).get();
    if (doc.exists) {
      return doc.data();
    }
    return {
      language: 'English',
      darkMode: true,
      notification: true,
      security: {},
    };
  }

  async updateSettings(uid: string, body: any) {
    await this.collection.doc(uid).set(body, { merge: true });
    const updated = await this.collection.doc(uid).get();
    return { success: true, settings: updated.data() };
  }
}
