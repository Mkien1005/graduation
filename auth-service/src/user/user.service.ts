import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
  async checkUserExist(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'fullName', 'email', 'role', 'isActive', 'password'], // Bật password khi đăng nhập
    });
  }
}
