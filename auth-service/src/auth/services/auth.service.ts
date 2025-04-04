import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserService } from '../../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MailService } from '../../mail/mailer.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailService: MailService,
  ) {}
  async register(registerDto: RegisterUserDto) {
    const { email, fullName, password, confirmPassword, captchaToken } =
      registerDto;
    // Kiểm tra captcha
    const verifyCaptcha = await this.verifyCaptcha(captchaToken);
    if (!verifyCaptcha || verifyCaptcha.success !== true) {
      throw new BadRequestException('Mã captcha không hợp lệ!');
    }
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại.');
    }
    // Kiểm tra mật khẩu và nhập lại mật khẩu
    if (password !== confirmPassword) {
      throw new BadRequestException('Mật khẩu không khớp.');
    }
    const jwtToken = await this.jwtService.signAsync(
      { email },
      {
        expiresIn: parseInt(
          this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
        ),
      },
    );
    await this.mailService.sendUserConfirmation(fullName, email, jwtToken);

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.save({
      ...registerDto,
      password: hashedPassword,
    });

    return {
      success: true,
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, rememberMe } = loginDto;

    // Kiểm tra email tồn tại
    const user = await this.userService.checkUserExist(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }
    // Kiểm tra mật khẩu
    if (!user.isActive) {
      throw new BadRequestException(
        'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản.',
      );
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('Mật khẩu không đúng.');
    }

    const payload = {
      sub: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: rememberMe
        ? this.configService.get('JWT_WITH_REMEMBER')
        : this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
    });
    return { accessToken, refreshToken };
  }
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newAccessToken = this.jwtService.sign(
        {
          fullName: payload.fullName,
          email: payload.email,
          role: payload.role,
          sub: payload.sub,
        },
        {
          expiresIn: parseInt(
            this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
          ),
        },
      );
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Refresh token không hợp lệ');
    }
  }

  async verifyAccount(email: string) {
    try {
      // Kiểm tra token có tồn tại trong database không
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return { success: false, message: 'Không tìm thấy người dùng.' };
      }

      await this.userRepository.update({ email }, { isActive: true });
      return { success: true, message: 'Xác minh tài khoản thành công.' };
    } catch (error) {
      return {
        success: false,
        message: 'Đã có lỗi xảy ra khi xác minh tài khoản.',
      };
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại');
    }
    const token = await this.jwtService.signAsync({ email });

    await this.mailService.sendResetPassword(email, token);
    return {
      success: true,
      message:
        'Vui lòng kiểm tra email để đặt lại mật khẩu. Nếu không thấy email, vui lòng kiểm tra thư mục spam.',
    };
  }

  async changePassword(
    email: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Mật khẩu không khớp.');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update({ email }, { password: hashedPassword });
    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công.',
    };
  }

  async verifyCaptcha(token: string) {
    const secretKey = this.configService.get('CAPTCHA_SECRET_KEY');
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    return response.data;
  }
}
