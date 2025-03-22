import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
export class RegisterUserDto extends CreateUserDto {
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống.' })
  @IsString()
  confirmPassword: string;

  @IsNotEmpty({ message: 'Mã captcha không được để trống.' })
  @IsString({ message: 'Mã captcha phải là chuỗi ký tự' })
  captchaToken: string;
}
