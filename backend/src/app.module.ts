import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { validarConfiguracao } from './config/validar-configuracao';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      // O Prisma pode carregar .env antes deste módulo; em testes, prevalece .env.test.
      validatePredefined: process.env.NODE_ENV !== 'test',
      validate: validarConfiguracao,
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
