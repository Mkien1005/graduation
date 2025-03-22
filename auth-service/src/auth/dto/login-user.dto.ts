import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe: boolean;
}
