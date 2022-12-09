import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '../auth/decorator/get-user.decorator';
import { User as UserModel } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('/identify')
  getMe(@User() user: UserModel) {
    return user;
  }

  @Patch()
  editUser(@User('id') id: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(id, dto);
  }
}
