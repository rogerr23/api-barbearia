import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Prisma e banco de teste', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('conecta ao banco de teste, separado do desenvolvimento', async () => {
    const prisma = app.get(PrismaService);
    const resultado = await prisma.$queryRaw<Array<{ banco: string }>>`
      SELECT current_database() AS banco
    `;
    expect(resultado[0].banco).toBe('barbearia_test');
  });
});
