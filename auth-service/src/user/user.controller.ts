import { Controller, Get, Param, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  async findOne(@Req() req: any) {
    const { email } = req.user;
    return await this.userService.findByEmail(email);
  }
}
