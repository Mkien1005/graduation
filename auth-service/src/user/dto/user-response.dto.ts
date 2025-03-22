import { UserRole } from 'src/common/constant';
import {
  IsUUID,
  IsString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsDate,
} from 'class-validator';

export class UserResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsNumber()
  walletBalance: number;

  @IsDate()
  createdAt: Date;
}
