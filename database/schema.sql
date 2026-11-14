-- Portal de Vagas de Emprego — esquema MySQL 8 (utf8mb4)
CREATE DATABASE IF NOT EXISTS portal_vagas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portal_vagas;

CREATE TABLE IF NOT EXISTS provincias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL UNIQUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS utilizadores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(160) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  telefone VARCHAR(30) NULL,
  senha_hash VARCHAR(100) NOT NULL,
  tipo ENUM('candidato','empresa','admin') NOT NULL DEFAULT 'candidato',
  provincia_id INT UNSIGNED NULL,
  titulo VARCHAR(160) NULL,
  escolaridade VARCHAR(60) NULL,
  experiencia VARCHAR(100) NULL,
  bio VARCHAR(600) NULL,
  competencias VARCHAR(300) NULL,
  foto VARCHAR(200) NULL,               -- foto do candidato / logótipo da empresa
  curriculo VARCHAR(200) NULL,          -- ficheiro guardado
  curriculo_nome VARCHAR(200) NULL,     -- nome original
  curriculo_em TIMESTAMP NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_util_prov FOREIGN KEY (provincia_id) REFERENCES provincias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS empresas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  utilizador_id INT UNSIGNED NOT NULL UNIQUE,
  nome_empresa VARCHAR(200) NOT NULL,
  nif VARCHAR(30) NULL,
  website VARCHAR(255) NULL,
  setor VARCHAR(150) NULL,
  endereco VARCHAR(255) NULL,
  tamanho VARCHAR(20) NULL,
  descricao VARCHAR(800) NULL,
  CONSTRAINT fk_emp_util FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vagas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT UNSIGNED NOT NULL,            -- utilizadores.id da empresa
  titulo VARCHAR(200) NOT NULL,
  provincia_id INT UNSIGNED NOT NULL,
  categoria_id INT UNSIGNED NOT NULL,
  tipo_contrato ENUM('tempo_inteiro','part_time','temporario','estagio','contrato') NOT NULL DEFAULT 'tempo_inteiro',
  regime ENUM('presencial','hibrido','remoto') NOT NULL DEFAULT 'presencial',
  numero_vagas SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  experiencia VARCHAR(100) NOT NULL DEFAULT 'Sem experiência',
  salario VARCHAR(100) NULL,
  prazo DATE NULL,
  descricao TEXT NOT NULL,
  responsabilidades TEXT NULL,
  requisitos TEXT NULL,
  beneficios TEXT NULL,
  email_contacto VARCHAR(200) NULL,
  estado ENUM('pendente','aprovada','rejeitada','encerrada') NOT NULL DEFAULT 'pendente',
  visualizacoes INT UNSIGNED NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vagas_estado (estado, criado_em),
  INDEX idx_vagas_filtros (provincia_id, categoria_id),
  CONSTRAINT fk_vaga_emp FOREIGN KEY (empresa_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
  CONSTRAINT fk_vaga_prov FOREIGN KEY (provincia_id) REFERENCES provincias(id),
  CONSTRAINT fk_vaga_cat FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS candidaturas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vaga_id INT UNSIGNED NOT NULL,
  candidato_id INT UNSIGNED NOT NULL,
  nome VARCHAR(160) NOT NULL,
  email VARCHAR(200) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  curriculo VARCHAR(200) NOT NULL,      -- cópia fixa do currículo no momento da candidatura
  curriculo_nome VARCHAR(200) NULL,
  mensagem VARCHAR(1500) NULL,
  estado ENUM('pendente','em_analise','aceite','rejeitada','retirada') NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_candidatura (vaga_id, candidato_id),
  CONSTRAINT fk_cand_vaga FOREIGN KEY (vaga_id) REFERENCES vagas(id) ON DELETE CASCADE,
  CONSTRAINT fk_cand_util FOREIGN KEY (candidato_id) REFERENCES utilizadores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vagas_guardadas (
  candidato_id INT UNSIGNED NOT NULL,
  vaga_id INT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (candidato_id, vaga_id),
  CONSTRAINT fk_g_util FOREIGN KEY (candidato_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
  CONSTRAINT fk_g_vaga FOREIGN KEY (vaga_id) REFERENCES vagas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensagens_contacto (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(160) NOT NULL,
  email VARCHAR(200) NOT NULL,
  assunto VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO provincias (nome) VALUES
('Bengo'),('Benguela'),('Bié'),('Cabinda'),('Cuando'),('Cubango'),('Cuanza Norte'),('Cuanza Sul'),
('Cunene'),('Huambo'),('Huíla'),('Icolo e Bengo'),('Luanda'),('Lunda Norte'),('Lunda Sul'),('Malanje'),
('Moxico'),('Moxico Leste'),('Namibe'),('Uíge'),('Zaire');

INSERT IGNORE INTO categorias (nome) VALUES
('Administração e gestão'),('Agricultura e ambiente'),('Comércio e atendimento ao cliente'),
('Construção civil'),('Design e artes'),('Educação e formação'),('Engenharia'),
('Informática e tecnologia'),('Logística e transportes'),('Marketing e publicidade'),
('Petróleo, gás e energia'),('Saúde'),('Serviços financeiros'),('Telecomunicações'),('Outras');
