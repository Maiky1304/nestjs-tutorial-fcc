import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: AuthDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user doesn't exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // compare passwords
    const passwordMatches = await argon.verify(user.password, dto.password);

    // if password incorrect throw exception
    if (!passwordMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // send back user
    delete user.password;
    return {
      access_token: await this.signToken(user.id, user.email),
    };
  }

  signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };
    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
  }

  async register(dto: AuthDto) {
    // generate hash
    const hash = await argon.hash(dto.password);

    // save in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });
      delete user.password;

      // return user
      return user;
    } catch (error) {
      if (!(error instanceof PrismaClientKnownRequestError)) {
        return;
      }

      if (error.code !== 'P2002') {
        return;
      }

      throw new ForbiddenException('Credentials taken');
    }
  }
}
