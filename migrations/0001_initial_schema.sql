-- WMS Ticket System - Schema Inicial
-- Database unificado para sincronização cross-device

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  setor TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal de chamados
CREATE TABLE IF NOT EXISTS chamados (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'andamento', 'finalizada', 'cancelada')),
  solicitante_id TEXT,
  solicitante_nome TEXT NOT NULL,
  solicitante_email TEXT NOT NULL,
  solicitante_telefone TEXT,
  solicitante_setor TEXT,
  responsavel_id TEXT,
  responsavel_nome TEXT,
  data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_vencimento DATETIME,
  observacoes TEXT,
  tags TEXT, -- JSON array como texto
  anexos TEXT, -- JSON array como texto
  FOREIGN KEY (solicitante_id) REFERENCES users(id),
  FOREIGN KEY (responsavel_id) REFERENCES users(id)
);

-- Tabela de histórico de chamados
CREATE TABLE IF NOT EXISTS chamado_historico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chamado_id TEXT NOT NULL,
  acao TEXT NOT NULL,
  usuario_id TEXT,
  usuario_nome TEXT NOT NULL,
  detalhes TEXT,
  status_anterior TEXT,
  status_novo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chamado_id) REFERENCES chamados(id),
  FOREIGN KEY (usuario_id) REFERENCES users(id)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  tipo TEXT DEFAULT 'text',
  categoria TEXT DEFAULT 'geral',
  descricao TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de templates de email
CREATE TABLE IF NOT EXISTS email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL,
  assunto TEXT NOT NULL,
  corpo_html TEXT NOT NULL,
  corpo_texto TEXT,
  variaveis TEXT, -- JSON array das variáveis disponíveis
  ativo BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chamado_id TEXT,
  destinatario TEXT NOT NULL,
  assunto TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro')),
  erro_mensagem TEXT,
  template_usado TEXT,
  message_id TEXT,
  tentativas INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME,
  FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_prioridade ON chamados(prioridade);
CREATE INDEX IF NOT EXISTS idx_chamados_data_abertura ON chamados(data_abertura);
CREATE INDEX IF NOT EXISTS idx_chamados_solicitante_email ON chamados(solicitante_email);
CREATE INDEX IF NOT EXISTS idx_chamados_responsavel_id ON chamados(responsavel_id);

CREATE INDEX IF NOT EXISTS idx_historico_chamado_id ON chamado_historico(chamado_id);
CREATE INDEX IF NOT EXISTS idx_historico_created_at ON chamado_historico(created_at);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_setor ON users(setor);

CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes(chave);
CREATE INDEX IF NOT EXISTS idx_configuracoes_categoria ON configuracoes(categoria);

CREATE INDEX IF NOT EXISTS idx_email_logs_chamado_id ON email_logs(chamado_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- Triggers para atualizar timestamp automaticamente
CREATE TRIGGER IF NOT EXISTS update_chamados_timestamp 
AFTER UPDATE ON chamados
FOR EACH ROW
BEGIN
  UPDATE chamados SET data_atualizacao = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_configuracoes_timestamp 
AFTER UPDATE ON configuracoes
FOR EACH ROW
BEGIN
  UPDATE configuracoes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;