import { validarConfiguracao } from './validar-configuracao';

const configuracaoValida = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://usuario:segredo@127.0.0.1:5432/barbearia_test',
  APP_TIMEZONE: 'America/Sao_Paulo',
};

describe('validarConfiguracao', () => {
  it('aceita banco de teste separado', () => {
    expect(validarConfiguracao(configuracaoValida).PORT).toBe(3000);
  });

  it('impede testes contra o banco de desenvolvimento', () => {
    expect(() =>
      validarConfiguracao({
        ...configuracaoValida,
        DATABASE_URL:
          'postgresql://usuario:segredo@127.0.0.1:5432/barbearia_db',
      }),
    ).toThrow(
      'Em test, DATABASE_URL deve apontar para um banco terminado em _test.',
    );
  });

  it('rejeita ausência de conexão sem expor credenciais', () => {
    expect(() =>
      validarConfiguracao({ ...configuracaoValida, DATABASE_URL: '' }),
    ).toThrow('DATABASE_URL é obrigatória.');
  });
});
