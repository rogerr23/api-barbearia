import { INestApplication } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Constraints das contas', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const prefixo = `task04-${process.pid}-${Date.now()}-`;
  let sequencia = 0;
  const proximoEmail = () => `${prefixo}${++sequencia}@exemplo.test`;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    if (!prisma) return;
    const usuarios = await prisma.usuario.findMany({
      where: { email: { startsWith: prefixo, mode: 'insensitive' } },
      select: { id: true },
    });
    const ids = usuarios.map((usuario) => usuario.id);
    if (ids.length === 0) return;

    await prisma.recuperacaoSenha.deleteMany({
      where: { usuarioId: { in: ids } },
    });
    await prisma.cliente.deleteMany({ where: { usuarioId: { in: ids } } });
    await prisma.barbeiro.deleteMany({ where: { usuarioId: { in: ids } } });
    await prisma.usuario.deleteMany({ where: { id: { in: ids } } });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('cria e busca Usuario com Cliente e bairro obrigatório', async () => {
    const email = proximoEmail();
    const usuario = await prisma.usuario.create({
      data: {
        email,
        senhaHash: 'hash-de-teste',
        perfil: 'CLIENTE',
        cliente: {
          create: { nome: 'Ana', telefone: '11999999999', bairro: 'Centro' },
        },
      },
      include: { cliente: true },
    });

    expect(usuario.cliente?.bairro).toBe('Centro');
    expect(usuario.primeiroAcesso).toBe(false);
    expect((await prisma.usuario.findUnique({ where: { email } }))?.id).toBe(
      usuario.id,
    );
    await expect(
      prisma.usuario.delete({ where: { id: usuario.id } }),
    ).rejects.toThrow();

    await expect(
      prisma.cliente.update({
        where: { id: usuario.cliente!.id },
        data: { bairro: ' ' },
      }),
    ).rejects.toThrow();
  });

  it('rejeita e-mail duplicado e não normalizado no banco', async () => {
    const email = proximoEmail();
    await prisma.usuario.create({
      data: { email, senhaHash: 'hash-de-teste', perfil: 'ADMINISTRADOR' },
    });

    await expect(
      prisma.usuario.create({
        data: { email, senhaHash: 'outro-hash', perfil: 'CLIENTE' },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.usuario.create({
        data: {
          email: email.toUpperCase(),
          senhaHash: 'outro-hash',
          perfil: 'CLIENTE',
        },
      }),
    ).rejects.toThrow();
  });

  it('impede vínculos incompatíveis com o perfil e sua alteração posterior', async () => {
    const administrador = await prisma.usuario.create({
      data: {
        email: proximoEmail(),
        senhaHash: 'hash-de-teste',
        perfil: 'ADMINISTRADOR',
      },
    });

    await expect(
      prisma.cliente.create({
        data: {
          usuarioId: administrador.id,
          nome: 'Ana',
          telefone: '11999999999',
          bairro: 'Centro',
        },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.barbeiro.create({
        data: {
          usuarioId: administrador.id,
          nome: 'João',
          telefone: '11988888888',
        },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.usuario.update({
        where: { id: administrador.id },
        data: { primeiroAcesso: true },
      }),
    ).rejects.toThrow();

    const cliente = await prisma.usuario.create({
      data: {
        email: proximoEmail(),
        senhaHash: 'hash-de-teste',
        perfil: 'CLIENTE',
        cliente: {
          create: { nome: 'Ana', telefone: '11999999999', bairro: 'Centro' },
        },
      },
    });
    await expect(
      prisma.usuario.update({
        where: { id: cliente.id },
        data: { perfil: 'BARBEIRO' },
      }),
    ).rejects.toThrow();
  });

  it('limita a comissão do Barbeiro a 100%', async () => {
    const usuario = await prisma.usuario.create({
      data: {
        email: proximoEmail(),
        senhaHash: 'hash-de-teste',
        perfil: 'BARBEIRO',
      },
    });

    await expect(
      prisma.barbeiro.create({
        data: {
          usuarioId: usuario.id,
          nome: 'João',
          telefone: '11988888888',
          comissaoPercentual: new Prisma.Decimal('100.01'),
        },
      }),
    ).rejects.toThrow();

    const barbeiro = await prisma.barbeiro.create({
      data: { usuarioId: usuario.id, nome: 'João', telefone: '11988888888' },
    });
    expect(barbeiro.comissaoPercentual.toString()).toBe('50');
    await expect(
      prisma.barbeiro.update({
        where: { id: barbeiro.id },
        data: { comissaoPercentual: new Prisma.Decimal('-0.01') },
      }),
    ).rejects.toThrow();
  });

  it('permite recuperação de senha do Administrador', async () => {
    const usuario = await prisma.usuario.create({
      data: {
        email: proximoEmail(),
        senhaHash: 'hash-de-teste',
        perfil: 'ADMINISTRADOR',
      },
    });
    const recuperacao = await prisma.recuperacaoSenha.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: `${prefixo}hash-token`,
        expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    expect(recuperacao.utilizadoEm).toBeNull();
  });
});
