import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  me(@CurrentUser() user: any) {
    return this.authService.me(user);
  }

  @Put('profile')
  @UseGuards(FirebaseAuthGuard)
  updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.authService.updateProfile(user.uid, body);
  }
}
