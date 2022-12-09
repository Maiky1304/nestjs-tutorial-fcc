import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '../auth/decorator/get-user.decorator';

@Controller('/users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('/identify')
  getMe(@User() user: any) {
    return user;
  }
}
