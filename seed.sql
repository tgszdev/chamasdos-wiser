-- Dados iniciais para o WMS Ticket System

-- Configurações padrão do sistema
INSERT OR IGNORE INTO configuracoes (chave, valor, tipo, categoria, descricao) VALUES 
  ('empresa_nome', 'WMS Company', 'text', 'empresa', 'Nome da empresa'),
  ('empresa_email', 'contato@wmscompany.com', 'email', 'empresa', 'Email principal da empresa'),
  ('empresa_telefone', '(11) 99999-9999', 'text', 'empresa', 'Telefone da empresa'),
  ('smtp_host', 'smtp.gmail.com', 'text', 'smtp', 'Servidor SMTP'),
  ('smtp_port', '587', 'number', 'smtp', 'Porta do servidor SMTP'),
  ('smtp_security', 'STARTTLS', 'text', 'smtp', 'Tipo de segurança (SSL/STARTTLS)'),
  ('smtp_user', '', 'email', 'smtp', 'Usuário SMTP'),
  ('smtp_password', '', 'password', 'smtp', 'Senha SMTP'),
  ('notificacoes_ativas', 'true', 'boolean', 'sistema', 'Enviar notificações por email'),
  ('auto_assign', 'false', 'boolean', 'sistema', 'Atribuição automática de chamados'),
  ('theme', 'light', 'text', 'interface', 'Tema da interface');

-- Templates de email padrão
INSERT OR IGNORE INTO email_templates (nome, assunto, corpo_html, corpo_texto, variaveis) VALUES 
  ('chamado_criado', 'Novo Chamado Criado - {titulo}', 
   '<h2>Novo Chamado WMS</h2><p><strong>ID:</strong> {chamado_id}<br><strong>Título:</strong> {titulo}<br><strong>Status:</strong> {status}<br><strong>Prioridade:</strong> {prioridade}<br><strong>Solicitante:</strong> {solicitante_nome}</p>',
   'Novo Chamado WMS\nID: {chamado_id}\nTítulo: {titulo}\nStatus: {status}\nPrioridade: {prioridade}\nSolicitante: {solicitante_nome}',
   '["chamado_id", "titulo", "status", "prioridade", "solicitante_nome", "descricao"]'),
  
  ('status_alterado', 'Status Alterado - Chamado {chamado_id}',
   '<h2>Status do Chamado Alterado</h2><p><strong>ID:</strong> {chamado_id}<br><strong>Título:</strong> {titulo}<br><strong>Status Anterior:</strong> {status_anterior}<br><strong>Novo Status:</strong> {status_novo}<br><strong>Alterado por:</strong> {usuario_nome}</p>',
   'Status do Chamado Alterado\nID: {chamado_id}\nTítulo: {titulo}\nStatus Anterior: {status_anterior}\nNovo Status: {status_novo}\nAlterado por: {usuario_nome}',
   '["chamado_id", "titulo", "status_anterior", "status_novo", "usuario_nome", "observacoes"]'),
   
  ('chamado_finalizado', 'Chamado Finalizado - {titulo}',
   '<h2>Chamado Finalizado</h2><p><strong>ID:</strong> {chamado_id}<br><strong>Título:</strong> {titulo}<br><strong>Finalizado por:</strong> {usuario_nome}<br><strong>Data:</strong> {data_finalizacao}</p>',
   'Chamado Finalizado\nID: {chamado_id}\nTítulo: {titulo}\nFinalizado por: {usuario_nome}\nData: {data_finalizacao}',
   '["chamado_id", "titulo", "usuario_nome", "data_finalizacao", "observacoes"]');

-- Usuários de exemplo para teste
INSERT OR IGNORE INTO users (id, nome, email, telefone, setor, role) VALUES 
  ('USER001', 'Admin Sistema', 'admin@wmscompany.com', '(11) 98765-4321', 'TI', 'admin'),
  ('USER002', 'João Silva', 'joao.silva@wmscompany.com', '(11) 98765-4322', 'Vendas', 'user'),
  ('USER003', 'Maria Santos', 'maria.santos@wmscompany.com', '(11) 98765-4323', 'RH', 'user'),
  ('USER004', 'Carlos Oliveira', 'carlos.oliveira@wmscompany.com', '(11) 98765-4324', 'Financeiro', 'user');

-- Chamados de exemplo para demonstração
INSERT OR IGNORE INTO chamados (
  id, titulo, descricao, prioridade, status, 
  solicitante_id, solicitante_nome, solicitante_email, solicitante_telefone, solicitante_setor,
  responsavel_id, responsavel_nome, observacoes
) VALUES 
  ('WMS001', 'Sistema lento na área de vendas', 'O sistema está muito lento para carregar relatórios de vendas', 'alta', 'aberta', 
   'USER002', 'João Silva', 'joao.silva@wmscompany.com', '(11) 98765-4322', 'Vendas',
   'USER001', 'Admin Sistema', 'Chamado em investigação'),
   
  ('WMS002', 'Erro no cadastro de clientes', 'Não consigo salvar novos clientes no sistema', 'urgente', 'andamento', 
   'USER002', 'João Silva', 'joao.silva@wmscompany.com', '(11) 98765-4322', 'Vendas',
   'USER001', 'Admin Sistema', 'Bug identificado, correção em andamento'),
   
  ('WMS003', 'Solicitação de novo relatório', 'Precisamos de um relatório mensal de folha de pagamento', 'media', 'aberta', 
   'USER003', 'Maria Santos', 'maria.santos@wmscompany.com', '(11) 98765-4323', 'RH',
   NULL, NULL, 'Aguardando análise de viabilidade'),
   
  ('WMS004', 'Problema de impressão', 'Impressora não funciona com o sistema', 'baixa', 'finalizada', 
   'USER004', 'Carlos Oliveira', 'carlos.oliveira@wmscompany.com', '(11) 98765-4324', 'Financeiro',
   'USER001', 'Admin Sistema', 'Problema resolvido - driver atualizado');

-- Histórico dos chamados de exemplo
INSERT OR IGNORE INTO chamado_historico (chamado_id, acao, usuario_id, usuario_nome, detalhes) VALUES 
  ('WMS001', 'Chamado criado', 'USER002', 'João Silva', 'Chamado aberto pelo solicitante'),
  ('WMS001', 'Responsável atribuído', 'USER001', 'Admin Sistema', 'Chamado atribuído para investigação'),
  
  ('WMS002', 'Chamado criado', 'USER002', 'João Silva', 'Chamado aberto pelo solicitante'),
  ('WMS002', 'Status alterado: aberta → andamento', 'USER001', 'Admin Sistema', 'Iniciando correção do bug'),
  
  ('WMS003', 'Chamado criado', 'USER003', 'Maria Santos', 'Solicitação de novo relatório'),
  
  ('WMS004', 'Chamado criado', 'USER004', 'Carlos Oliveira', 'Problema com impressora'),
  ('WMS004', 'Status alterado: aberta → andamento', 'USER001', 'Admin Sistema', 'Investigando problema de driver'),
  ('WMS004', 'Status alterado: andamento → finalizada', 'USER001', 'Admin Sistema', 'Problema resolvido - driver atualizado');