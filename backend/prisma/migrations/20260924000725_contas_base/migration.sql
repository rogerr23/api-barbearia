-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('CLIENTE', 'BARBEIRO', 'ADMINISTRADOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "primeiroAcesso" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "criadoEm" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barbeiro" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "comissaoPercentual" DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    "criadoEm" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Barbeiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecuperacaoSenha" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEm" TIMESTAMPTZ(6) NOT NULL,
    "utilizadoEm" TIMESTAMPTZ(6),
    "criadoEm" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecuperacaoSenha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_usuarioId_key" ON "Cliente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Barbeiro_usuarioId_key" ON "Barbeiro"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "RecuperacaoSenha_tokenHash_key" ON "RecuperacaoSenha"("tokenHash");

-- CreateIndex
CREATE INDEX "RecuperacaoSenha_usuarioId_idx" ON "RecuperacaoSenha"("usuarioId");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barbeiro" ADD CONSTRAINT "Barbeiro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecuperacaoSenha" ADD CONSTRAINT "RecuperacaoSenha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Usuario"
ADD CONSTRAINT "Usuario_email_normalizado_check"
CHECK ("email" = lower(btrim("email")) AND "email" <> '');

ALTER TABLE "Cliente"
ADD CONSTRAINT "Cliente_bairro_nao_vazio_check"
CHECK (btrim("bairro") <> '');

ALTER TABLE "Barbeiro"
ADD CONSTRAINT "Barbeiro_comissao_percentual_check"
CHECK ("comissaoPercentual" BETWEEN 0 AND 100);

ALTER TABLE "Usuario"
ADD CONSTRAINT "Usuario_primeiro_acesso_perfil_check"
CHECK (NOT "primeiroAcesso" OR "perfil" = 'BARBEIRO');

ALTER TABLE "Usuario"
ADD CONSTRAINT "Usuario_senha_hash_nao_vazio_check"
CHECK (btrim("senhaHash") <> '');

ALTER TABLE "Cliente"
ADD CONSTRAINT "Cliente_dados_obrigatorios_check"
CHECK (btrim("nome") <> '' AND btrim("telefone") <> '');

ALTER TABLE "Barbeiro"
ADD CONSTRAINT "Barbeiro_dados_obrigatorios_check"
CHECK (btrim("nome") <> '' AND btrim("telefone") <> '');

ALTER TABLE "RecuperacaoSenha"
ADD CONSTRAINT "RecuperacaoSenha_token_hash_nao_vazio_check"
CHECK (btrim("tokenHash") <> '');

-- Bloqueia associação a um perfil diferente, inclusive sob atualização concorrente.
CREATE FUNCTION "validarPerfilCliente"() RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "Usuario"
        WHERE "id" = NEW."usuarioId" AND "perfil" = 'CLIENTE'
        FOR UPDATE
    ) THEN
        RAISE EXCEPTION 'Usuario vinculado a Cliente deve ter perfil CLIENTE.'
            USING ERRCODE = '23514', CONSTRAINT = 'Cliente_usuario_perfil_check';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Cliente_validar_perfil"
BEFORE INSERT OR UPDATE OF "usuarioId" ON "Cliente"
FOR EACH ROW EXECUTE FUNCTION "validarPerfilCliente"();

CREATE FUNCTION "validarPerfilBarbeiro"() RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "Usuario"
        WHERE "id" = NEW."usuarioId" AND "perfil" = 'BARBEIRO'
        FOR UPDATE
    ) THEN
        RAISE EXCEPTION 'Usuario vinculado a Barbeiro deve ter perfil BARBEIRO.'
            USING ERRCODE = '23514', CONSTRAINT = 'Barbeiro_usuario_perfil_check';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Barbeiro_validar_perfil"
BEFORE INSERT OR UPDATE OF "usuarioId" ON "Barbeiro"
FOR EACH ROW EXECUTE FUNCTION "validarPerfilBarbeiro"();

CREATE FUNCTION "validarAlteracaoPerfilUsuario"() RETURNS trigger AS $$
BEGIN
    IF (NEW."perfil" <> 'CLIENTE' AND EXISTS (
        SELECT 1 FROM "Cliente" WHERE "usuarioId" = NEW."id"
    )) OR (NEW."perfil" <> 'BARBEIRO' AND EXISTS (
        SELECT 1 FROM "Barbeiro" WHERE "usuarioId" = NEW."id"
    )) THEN
        RAISE EXCEPTION 'Perfil do Usuario e incompatível com seu cadastro.'
            USING ERRCODE = '23514', CONSTRAINT = 'Usuario_perfil_cadastro_check';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Usuario_validar_alteracao_perfil"
BEFORE UPDATE OF "perfil" ON "Usuario"
FOR EACH ROW EXECUTE FUNCTION "validarAlteracaoPerfilUsuario"();
