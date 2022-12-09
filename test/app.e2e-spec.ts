import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('app e2e test', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const authData: AuthDto = {
      email: 'name.lastname@e2e.test',
      password: 'password',
    };

    describe('Register', () => {
      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            password: authData.password,
          })
          .expectStatus(400);
      });

      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            email: authData.email,
          })
          .expectStatus(400);
      });

      it('should throw error if no body provided', () => {
        return pactum.spec().post('/auth/register').expectStatus(400);
      });

      it('should register', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(authData)
          .expectStatus(201);
      });
    });
    describe('Login', () => {
      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: authData.password,
          })
          .expectStatus(400);
      });

      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: authData.email,
          })
          .expectStatus(400);
      });

      it('should throw error if no body provided', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });

      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(authData)
          .expectStatus(200)
          .stores('access_token', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Identify', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/identify')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it('should edit user', () => {
        const body: EditUserDto = {
          firstName: 'John',
        };

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .withBody(body)
          .expectStatus(200)
          .expectBodyContains(body.firstName);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty boomarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectJsonLength(0);
      });
    });

    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Bookmark',
        link: 'https://google.com/',
      };

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmark_id', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmark_id}');
      });
    });

    describe('Edit bookmark', () => {
      const dto: EditBookmarkDto = {
        title: 'Some cool new title for e2e testing',
        description: 'Some cool description for e2e testing',
      };

      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectJsonLength(0);
      });
    });
  });
});
