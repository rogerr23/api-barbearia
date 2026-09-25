import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const urlBanco = process.env.DATABASE_URL;
let nomeBanco;

try {
  nomeBanco = new URL(urlBanco).pathname.slice(1);
} catch {
  console.error('DATABASE_URL de teste ausente ou inválida.');
  process.exit(1);
}

if (process.env.NODE_ENV !== 'test' || !nomeBanco.endsWith('_test')) {
  console.error(
    'Migrations de teste exigem NODE_ENV=test e banco terminado em _test.',
  );
  process.exit(1);
}

const prismaCli = fileURLToPath(
  new URL('../node_modules/prisma/build/index.js', import.meta.url),
);
const resultado = spawnSync(
  process.execPath,
  [prismaCli, 'migrate', 'deploy'],
  {
    env: process.env,
    stdio: 'inherit',
  },
);

if (resultado.error) {
  console.error('Não foi possível executar as migrations do banco de teste.');
  process.exit(1);
}

process.exit(resultado.status ?? 1);
