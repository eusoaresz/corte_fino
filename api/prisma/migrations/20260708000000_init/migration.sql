-- CreateTable
CREATE TABLE `barbeiros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `descricao` TEXT NULL,
    `foto` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;

-- CreateTable
CREATE TABLE `servicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `descricao` TEXT NULL,
    `preco` DECIMAL(9, 2) NOT NULL,
    `duracao_minutos` INTEGER NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;

-- CreateTable
CREATE TABLE `disponibilidades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `barbeiro_id` INTEGER NOT NULL,
    `dia_semana` ENUM('DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO') NOT NULL,
    `hora_inicio` VARCHAR(5) NOT NULL,
    `hora_fim` VARCHAR(5) NOT NULL,
    `intervalo_minutos` INTEGER NOT NULL DEFAULT 30,

    UNIQUE INDEX `disponibilidades_barbeiro_id_dia_semana_hora_inicio_key`(`barbeiro_id`, `dia_semana`, `hora_inicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;

-- CreateTable
CREATE TABLE `bloqueios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `barbeiro_id` INTEGER NOT NULL,
    `data` DATE NOT NULL,
    `hora_inicio` VARCHAR(5) NULL,
    `hora_fim` VARCHAR(5) NULL,
    `motivo` VARCHAR(120) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;

-- CreateTable
CREATE TABLE `agendamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `barbeiro_id` INTEGER NOT NULL,
    `servico_id` INTEGER NOT NULL,
    `cliente_nome` VARCHAR(60) NOT NULL,
    `cliente_telefone` VARCHAR(20) NOT NULL,
    `cliente_email` VARCHAR(60) NULL,
    `data` DATE NOT NULL,
    `hora_inicio` VARCHAR(5) NOT NULL,
    `hora_fim` VARCHAR(5) NOT NULL,
    `status` ENUM('CONFIRMADO', 'CANCELADO', 'CONCLUIDO') NOT NULL DEFAULT 'CONFIRMADO',
    `observacoes` TEXT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `agendamentos_barbeiro_id_data_hora_inicio_key`(`barbeiro_id`, `data`, `hora_inicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `email` VARCHAR(60) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `ultimo_login` DATETIME(3) NULL,
    `primeiro_acesso` BOOLEAN NOT NULL DEFAULT true,
    `codigo_recuperacao` VARCHAR(10) NULL,
    `codigo_expiracao` DATETIME(3) NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;

-- CreateTable
CREATE TABLE `logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `acao` VARCHAR(100) NOT NULL,
    `detalhes` TEXT NULL,
    `ip` VARCHAR(45) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;

-- AddForeignKey
ALTER TABLE `disponibilidades` ADD CONSTRAINT `disponibilidades_barbeiro_id_fkey` FOREIGN KEY (`barbeiro_id`) REFERENCES `barbeiros`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bloqueios` ADD CONSTRAINT `bloqueios_barbeiro_id_fkey` FOREIGN KEY (`barbeiro_id`) REFERENCES `barbeiros`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_barbeiro_id_fkey` FOREIGN KEY (`barbeiro_id`) REFERENCES `barbeiros`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_servico_id_fkey` FOREIGN KEY (`servico_id`) REFERENCES `servicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
