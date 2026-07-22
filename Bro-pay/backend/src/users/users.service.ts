import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection('users');
  }

  async findByEmail(email: string) {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { uid: doc.id, ...doc.data() } as any;
  }

  async findByUid(uid: string) {
    const doc = await this.collection.doc(uid).get();
    if (!doc.exists) return null;
    return { uid: doc.id, ...doc.data() } as any;
  }

  async create(uid: string, data: any) {
    await this.collection.doc(uid).set(data);
    return { uid, ...data };
  }

  async updateProfile(uid: string, data: any) {
    const user = await this.findByUid(uid);
    if (!user) return null;
    await this.collection.doc(uid).update(data);
    return this.findByUid(uid);
  }
}
