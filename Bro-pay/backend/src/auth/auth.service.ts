import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const userRecord = await this.firebaseService.getAuth().createUser({
      email: dto.email,
      password: dto.password,
      displayName: dto.name,
    });

    const userData = {
      uid: userRecord.uid,
      name: dto.name,
      email: dto.email,
      phone: '',
      avatar: '',
      memberSince: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.usersService.create(userRecord.uid, userData);

    const { password, ...safeUser } = userData as any;
    return { success: true, message: 'User registered successfully', user: safeUser };
  }

  async login(dto: LoginDto) {
    if (!dto.idToken) {
      throw new UnauthorizedException('Firebase ID token is required');
    }

    try {
      const decodedToken = await this.firebaseService.getAuth().verifyIdToken(dto.idToken);
      const user = await this.usersService.findByUid(decodedToken.uid);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        success: true,
        message: 'Login successful',
        user,
        token: dto.idToken,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }

  async me(user: any) {
    const userData = await this.usersService.findByUid(user.uid);
    if (!userData) {
      throw new UnauthorizedException('User not found');
    }
    return { user: userData };
  }

  async updateProfile(uid: string, body: any) {
    const authUpdate: any = {};
    if (body.name) authUpdate.displayName = body.name;
    if (body.email) authUpdate.email = body.email;

    if (Object.keys(authUpdate).length) {
      await this.firebaseService.getAuth().updateUser(uid, authUpdate);
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;

    const updated = await this.usersService.updateProfile(uid, updateData);
    if (!updated) {
      throw new UnauthorizedException('User not found');
    }
    return { success: true, user: updated };
  }
}
