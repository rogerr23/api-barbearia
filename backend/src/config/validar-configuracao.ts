type Ambiente = 'development' | 'test' | 'production';

export function validarConfiguracao(config: Record<string, unknown>) {
  const ambiente = config.NODE_ENV ?? 'development';
  if (
    typeof ambiente !== 'string' ||
    !['development', 'test', 'production'].includes(ambiente)
  ) {
    throw new Error('NODE_ENV deve ser development, test ou production.');
  }

  const porta = Number(config.PORT ?? 3000);
  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error('PORT deve ser uma porta TCP válida.');
  }

  const urlBanco = config.DATABASE_URL;
  if (typeof urlBanco !== 'string' || urlBanco.trim() === '') {
    throw new Error('DATABASE_URL é obrigatória.');
  }

  let url: URL;
  try {
    url = new URL(urlBanco);
  } catch {
    throw new Error('DATABASE_URL deve ser uma URL PostgreSQL válida.');
  }

  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !url.hostname ||
    !url.username ||
    !url.password ||
    url.pathname.length < 2
  ) {
    throw new Error(
      'DATABASE_URL deve conter host, usuário, senha e banco PostgreSQL.',
    );
  }

  const nomeBanco = decodeURIComponent(url.pathname.slice(1));
  if (ambiente === 'test' && !nomeBanco.endsWith('_test')) {
    throw new Error(
      'Em test, DATABASE_URL deve apontar para um banco terminado em _test.',
    );
  }

  const fuso = config.APP_TIMEZONE;
  if (typeof fuso !== 'string' || fuso.trim() === '') {
    throw new Error('APP_TIMEZONE é obrigatória.');
  }
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: fuso });
  } catch {
    throw new Error('APP_TIMEZONE deve ser um fuso horário IANA válido.');
  }

  return {
    ...config,
    NODE_ENV: ambiente as Ambiente,
    PORT: porta,
    DATABASE_URL: urlBanco,
    APP_TIMEZONE: fuso,
  };
}
