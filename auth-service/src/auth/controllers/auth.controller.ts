import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginDto } from '../dto/login-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @Public()
  @Post('login')
  async findOne(@Body() loginUserDto: LoginDto, @Res() response: Response) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginUserDto);
    // Lưu access token vào cookie
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 giờ
    });
    // Lưu refresh token vào cookie
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: loginUserDto.rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000, // 30 ngày hoặc 7 ngày
    });

    return response.json({ success: true, message: 'Đăng nhập thành công' });
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Res() response: Response,
  ) {
    try {
      const { accessToken } = await this.authService.refreshToken(refreshToken);

      // Cập nhật access token mới
      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000, // 1 giờ
      });

      return response.json({
        success: true,
        message: 'Làm mới token thành công',
      });
    } catch (error) {
      return response.status(401).json({ message: 'Làm mới token thất bại' });
    }
  }

  @Post('verify')
  async verifyAccount(@Req() req: any) {
    return await this.authService.verifyAccount(req.user.email);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.forgotPassword(email);
  }

  @Post('change-password')
  async changePassword(@Req() req: any, @Body() body: any) {
    const email = req.user.email;
    const { password, confirmPassword } = body;
    return await this.authService.changePassword(
      email,
      password,
      confirmPassword,
    );
  }

  @Public()
  @Post('verify-captcha')
  async verifyCaptcha(@Body('token') token: string) {
    return await this.authService.verifyCaptcha(token);
  }
}
