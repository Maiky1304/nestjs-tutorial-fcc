import {
  Delete,
  ForbiddenException,
  Get,
  Injectable,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        user_id: userId,
        ...dto,
      },
    });
    return bookmark;
  }

  async getBookmarks(userId: number) {
    return await this.prisma.bookmark.findMany({
      where: {
        user_id: userId,
      },
    });
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.user_id !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.user_id !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.user_id !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
