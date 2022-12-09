import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '../auth/decorator/get-user.decorator';
import { User as UserModel } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('/users')
export class UserController {
  @HttpCode(HttpStatus.OK)
  @Get('/identify')
  getMe(@User() user: UserModel) {
    return user;
  }
}
