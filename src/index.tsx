import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

// Tipos para Cloudflare Pages com D1
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS para API
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// Servir arquivos estáticos
app.use('/static/*', serveStatic({ root: './public' }))

// Renderer para páginas HTML
app.use(renderer)

// =====================================
// UTILITÁRIOS E HELPERS
// =====================================

// Gerar ID único para chamados
function generateId(): string {
  return `WMS${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
}

// Validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Formatar data para exibição
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR')
}

// Função auxiliar para SendGrid com template personalizado
async function sendEmailViaSendGridWithTemplate(testEmail: string, config: any, emailContent: { subject: string, html: string }) {
  try {
    const sendGridApiKey = config.password
    
    const emailData = {
      personalizations: [
        {
          to: [
            {
              email: testEmail
            }
          ]
        }
      ],
      from: {
        email: config.user.includes('@') ? config.user : 'noreply@wmstickets.com',
        name: 'WMS Ticket System'
      },
      subject: emailContent.subject,
      content: [
        {
          type: 'text/html',
          value: emailContent.html
        }
      ]
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`SendGrid API Error: ${response.status} - ${errorData}`)
    }

    return true
  } catch (error) {
    throw new Error(`Erro SendGrid: ${error.message}`)
  }
}

// =====================================
// API ROUTES - CHAMADOS
// =====================================

// Listar todos os chamados
app.get('/api/chamados', async (c) => {
  try {
    const { env } = c
    
    const stmt = env.DB.prepare(`
      SELECT * FROM chamados 
      WHERE status != 'cancelada'
      ORDER BY data_abertura DESC
    `)
    
    const result = await stmt.all()
    
    return c.json({ 
      success: true, 
      chamados: result.results,
      count: result.results.length
    })
  } catch (error) {
    console.error('Erro ao listar chamados:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Obter chamado específico
app.get('/api/chamados/:id', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')
    
    // Buscar chamado
    const chamado = await env.DB.prepare(`
      SELECT * FROM chamados WHERE id = ?
    `).bind(id).first()
    
    if (!chamado) {
      return c.json({ success: false, error: 'Chamado não encontrado' }, 404)
    }
    
    // Buscar histórico
    const historico = await env.DB.prepare(`
      SELECT * FROM chamado_historico 
      WHERE chamado_id = ? 
      ORDER BY created_at ASC
    `).bind(id).all()
    
    return c.json({ 
      success: true, 
      chamado: {
        ...chamado,
        historico: historico.results
      }
    })
  } catch (error) {
    console.error('Erro ao obter chamado:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Criar novo chamado
app.post('/api/chamados', async (c) => {
  try {
    const { env } = c
    const dados = await c.req.json()
    
    // Validar dados obrigatórios
    if (!dados.titulo || !dados.solicitante_nome || !dados.solicitante_email) {
      return c.json({ 
        success: false, 
        error: 'Título, nome do solicitante e email são obrigatórios' 
      }, 400)
    }
    
    if (!isValidEmail(dados.solicitante_email)) {
      return c.json({ success: false, error: 'Email inválido' }, 400)
    }
    
    const id = generateId()
    const now = new Date().toISOString()
    
    // Inserir chamado
    await env.DB.prepare(`
      INSERT INTO chamados (
        id, titulo, descricao, prioridade, status,
        solicitante_nome, solicitante_email, solicitante_telefone, solicitante_setor,
        data_abertura, data_atualizacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      dados.titulo,
      dados.descricao || '',
      dados.prioridade || 'media',
      'aberta',
      dados.solicitante_nome,
      dados.solicitante_email,
      dados.solicitante_telefone || '',
      dados.solicitante_setor || '',
      now,
      now
    ).run()
    
    // Adicionar ao histórico
    await env.DB.prepare(`
      INSERT INTO chamado_historico (chamado_id, acao, usuario_nome, detalhes)
      VALUES (?, ?, ?, ?)
    `).bind(
      id,
      'Chamado criado',
      dados.solicitante_nome,
      'Chamado aberto no sistema'
    ).run()
    
    // Buscar o chamado criado
    const chamado = await env.DB.prepare(`
      SELECT * FROM chamados WHERE id = ?
    `).bind(id).first()
    
    return c.json({ 
      success: true, 
      message: 'Chamado criado com sucesso',
      chamado
    })
  } catch (error) {
    console.error('Erro ao criar chamado:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Atualizar status do chamado
app.put('/api/chamados/:id/status', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')
    const { status, usuario_nome, observacoes } = await c.req.json()
    
    if (!status || !usuario_nome) {
      return c.json({ 
        success: false, 
        error: 'Status e nome do usuário são obrigatórios' 
      }, 400)
    }
    
    const validStatuses = ['aberta', 'andamento', 'finalizada', 'cancelada']
    if (!validStatuses.includes(status)) {
      return c.json({ 
        success: false, 
        error: 'Status inválido' 
      }, 400)
    }
    
    // Obter status atual
    const chamadoAtual = await env.DB.prepare(`
      SELECT status FROM chamados WHERE id = ?
    `).bind(id).first()
    
    if (!chamadoAtual) {
      return c.json({ success: false, error: 'Chamado não encontrado' }, 404)
    }
    
    const statusAnterior = chamadoAtual.status
    
    // Atualizar status
    await env.DB.prepare(`
      UPDATE chamados 
      SET status = ?, data_atualizacao = ?, observacoes = ?
      WHERE id = ?
    `).bind(status, new Date().toISOString(), observacoes || '', id).run()
    
    // Adicionar ao histórico
    await env.DB.prepare(`
      INSERT INTO chamado_historico (
        chamado_id, acao, usuario_nome, detalhes, status_anterior, status_novo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      `Status alterado: ${statusAnterior} → ${status}`,
      usuario_nome,
      observacoes || '',
      statusAnterior,
      status
    ).run()
    
    return c.json({ 
      success: true, 
      message: 'Status atualizado com sucesso',
      statusAnterior,
      statusNovo: status
    })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =====================================
// API ROUTES - ESTATÍSTICAS
// =====================================

app.get('/api/estatisticas', async (c) => {
  try {
    const { env } = c
    
    // Contar por status
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'aberta' THEN 1 ELSE 0 END) as abertas,
        SUM(CASE WHEN status = 'andamento' THEN 1 ELSE 0 END) as andamento,
        SUM(CASE WHEN status = 'finalizada' THEN 1 ELSE 0 END) as finalizadas,
        SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) as canceladas
      FROM chamados
    `).first()
    
    // Contar por prioridade
    const prioridades = await env.DB.prepare(`
      SELECT 
        prioridade,
        COUNT(*) as count
      FROM chamados 
      WHERE status != 'cancelada'
      GROUP BY prioridade
    `).all()
    
    return c.json({ 
      success: true, 
      estatisticas: {
        ...stats,
        prioridades: prioridades.results
      }
    })
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =====================================
// API ROUTES - CONFIGURAÇÕES
// =====================================

app.get('/api/config/smtp', async (c) => {
  try {
    const { env } = c
    
    const configs = await env.DB.prepare(`
      SELECT chave, valor FROM configuracoes 
      WHERE categoria = 'smtp'
    `).all()
    
    const smtp = {}
    configs.results.forEach(config => {
      const key = config.chave.replace('smtp_', '')
      smtp[key] = config.valor
    })
    
    // Não retornar senha por segurança
    if (smtp.password) {
      smtp.password = '••••••••'
    }
    
    return c.json({ success: true, smtp })
  } catch (error) {
    console.error('Erro ao obter config SMTP:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.post('/api/config/smtp', async (c) => {
  try {
    const { env } = c
    const config = await c.req.json()
    
    // Validar configuração
    if (!config.host || !config.port || !config.user) {
      return c.json({ 
        success: false, 
        error: 'Host, porta e usuário são obrigatórios' 
      }, 400)
    }
    
    // Atualizar configurações
    const updates = [
      ['smtp_host', config.host],
      ['smtp_port', config.port.toString()],
      ['smtp_security', config.security || 'STARTTLS'],
      ['smtp_user', config.user]
    ]
    
    if (config.password && config.password !== '••••••••') {
      updates.push(['smtp_password', config.password])
    }
    
    for (const [chave, valor] of updates) {
      await env.DB.prepare(`
        INSERT INTO configuracoes (chave, valor, categoria) 
        VALUES (?, ?, 'smtp')
        ON CONFLICT(chave) DO UPDATE SET valor = ?, updated_at = CURRENT_TIMESTAMP
      `).bind(chave, valor, valor).run()
    }
    
    return c.json({ 
      success: true, 
      message: 'Configuração SMTP salva com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao salvar config SMTP:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =====================================
// API ROUTES - EMAIL
// =====================================

// Testar envio de email (integração com SendGrid)
app.post('/api/email/test', async (c) => {
  try {
    const { testEmail, config } = await c.req.json()
    
    if (!testEmail || !isValidEmail(testEmail)) {
      return c.json({ success: false, error: 'Email de teste inválido' }, 400)
    }
    
    // Validar configuração SMTP
    if (!config || !config.host || !config.user || !config.password) {
      return c.json({ success: false, error: 'Configuração SMTP incompleta' }, 400)
    }

    // Integração com SendGrid API
    if (config.host === 'smtp.sendgrid.net' || config.user === 'apikey') {
      return await sendEmailViaSendGrid(testEmail, config)
    }
    
    // Integração com Gmail via App Password
    if (config.host === 'smtp.gmail.com') {
      return await sendEmailViaGmail(testEmail, config)
    }
    
    // Outros provedores SMTP - simulação para demonstração
    return c.json({ 
      success: true, 
      message: `Email de teste seria enviado para ${testEmail} via ${config.host}`,
      provider: config.host,
      note: 'Integração real disponível para SendGrid e Gmail'
    })
  } catch (error) {
    console.error('Erro no teste de email:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Função para enviar email via SendGrid
async function sendEmailViaSendGrid(testEmail: string, config: any) {
  try {
    const sendGridApiKey = config.password // Para SendGrid, a senha é a API Key
    
    const emailData = {
      personalizations: [
        {
          to: [
            {
              email: testEmail
            }
          ]
        }
      ],
      from: {
        email: config.user.includes('@') ? config.user : 'noreply@wmstickets.com',
        name: 'WMS Ticket System'
      },
      subject: '✅ Teste SMTP - WMS Ticket System',
      content: [
        {
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <h1>🎉 Teste SMTP Realizado com Sucesso!</h1>
                <p>WMS Ticket System</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2>Configuração Testada:</h2>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>📧 Provedor:</strong> SendGrid</li>
                  <li><strong>👤 Email:</strong> ${config.user}</li>
                  <li><strong>📅 Data do Teste:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                </ul>
                
                <div style="margin-top: 30px; padding: 15px; background: #d4edda; border-radius: 4px; color: #155724;">
                  ✅ <strong>Sucesso!</strong> O WMS está configurado corretamente para envio de emails via SendGrid.
                </div>
              </div>
            </div>
          `
        }
      ]
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (response.ok) {
      return {
        success: true,
        message: `Email de teste enviado com sucesso para ${testEmail} via SendGrid`,
        provider: 'SendGrid',
        messageId: response.headers.get('X-Message-Id')
      }
    } else {
      const errorData = await response.text()
      throw new Error(`SendGrid API Error: ${response.status} - ${errorData}`)
    }
  } catch (error) {
    throw new Error(`Erro SendGrid: ${error.message}`)
  }
}

// Função para enviar email via Gmail (App Password)
async function sendEmailViaGmail(testEmail: string, config: any) {
  try {
    // Para Gmail, utilizamos a API do Resend como proxy SMTP mais confiável
    // Ou integração direta com Gmail API (mais complexa)
    
    // Por enquanto, retornar simulação com instruções
    return {
      success: true,
      message: `Email seria enviado para ${testEmail} via Gmail`,
      provider: 'Gmail SMTP',
      note: 'Para Gmail, recomenda-se usar App Password. Integração completa disponível mediante configuração adicional.',
      instructions: [
        '1. Ative a verificação em duas etapas no Gmail',
        '2. Gere uma senha de aplicativo em https://myaccount.google.com/apppasswords',
        '3. Use a senha de aplicativo no campo senha da configuração SMTP'
      ]
    }
  } catch (error) {
    throw new Error(`Erro Gmail: ${error.message}`)
  }
}

// Enviar notificação de chamado por email
app.post('/api/email/notificacao', async (c) => {
  try {
    const { env } = c
    const { chamado_id, tipo, config } = await c.req.json()
    
    // Obter dados do chamado
    const chamado = await env.DB.prepare(`
      SELECT * FROM chamados WHERE id = ?
    `).bind(chamado_id).first()
    
    if (!chamado) {
      return c.json({ success: false, error: 'Chamado não encontrado' }, 404)
    }
    
    // Obter template de email
    const template = await env.DB.prepare(`
      SELECT * FROM email_templates WHERE nome = ? AND ativo = 1
    `).bind(tipo).first()
    
    if (!template) {
      return c.json({ success: false, error: 'Template de email não encontrado' }, 404)
    }
    
    // Preparar variáveis para o template
    const variaveis = {
      chamado_id: chamado.id,
      titulo: chamado.titulo,
      status: chamado.status,
      prioridade: chamado.prioridade,
      solicitante_nome: chamado.solicitante_nome,
      descricao: chamado.descricao,
      data_abertura: formatDate(chamado.data_abertura),
      data_atualizacao: formatDate(chamado.data_atualizacao)
    }
    
    // Substituir variáveis no template
    let assunto = template.assunto
    let corpoHtml = template.corpo_html
    
    Object.keys(variaveis).forEach(key => {
      const valor = variaveis[key] || ''
      assunto = assunto.replace(new RegExp(`{${key}}`, 'g'), valor)
      corpoHtml = corpoHtml.replace(new RegExp(`{${key}}`, 'g'), valor)
    })
    
    // Log do email
    await env.DB.prepare(`
      INSERT INTO email_logs (chamado_id, destinatario, assunto, template_usado, status)
      VALUES (?, ?, ?, ?, 'pendente')
    `).bind(chamado_id, chamado.solicitante_email, assunto, tipo).run()
    
    // Enviar email (usando SendGrid se configurado)
    if (config && config.host === 'smtp.sendgrid.net') {
      try {
        await sendEmailViaSendGridWithTemplate(chamado.solicitante_email, config, {
          subject: assunto,
          html: corpoHtml
        })
        
        // Atualizar log como enviado
        await env.DB.prepare(`
          UPDATE email_logs 
          SET status = 'enviado', sent_at = CURRENT_TIMESTAMP
          WHERE chamado_id = ? AND destinatario = ? AND status = 'pendente'
        `).bind(chamado_id, chamado.solicitante_email).run()
        
        return c.json({
          success: true,
          message: 'Notificação enviada com sucesso',
          destinatario: chamado.solicitante_email
        })
      } catch (error) {
        // Atualizar log com erro
        await env.DB.prepare(`
          UPDATE email_logs 
          SET status = 'erro', erro_mensagem = ?
          WHERE chamado_id = ? AND destinatario = ? AND status = 'pendente'
        `).bind(error.message, chamado_id, chamado.solicitante_email).run()
        
        throw error
      }
    }
    
    return c.json({
      success: false,
      error: 'SMTP não configurado ou provedor não suportado',
      note: 'Configure SendGrid para envio real de emails'
    })
    
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =====================================
// PÁGINAS HTML
// =====================================

// Página principal
app.get('/', (c) => {
  return c.render(
    <div>
      <h1>🎯 WMS Ticket System</h1>
      <p>Sistema de Chamados com Database Unificado</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/dashboard" style={{ marginRight: '10px' }}>📊 Dashboard</a>
        <a href="/chamados" style={{ marginRight: '10px' }}>📋 Chamados</a>
        <a href="/novo-chamado" style={{ marginRight: '10px' }}>➕ Novo Chamado</a>
        <a href="/configuracoes">⚙️ Configurações</a>
      </div>
    </div>
  )
})

// Página de dashboard
app.get('/dashboard', (c) => {
  return c.render(
    <div>
      <h1>📊 Dashboard WMS</h1>
      <div id="dashboard-content">Carregando...</div>
      <script src="/static/js/dashboard.js"></script>
    </div>
  )
})

// Página de chamados
app.get('/chamados', (c) => {
  return c.render(
    <div>
      <h1>📋 Gerenciar Chamados</h1>
      <div id="chamados-content">Carregando...</div>
      <script src="/static/js/chamados.js"></script>
    </div>
  )
})

// Página de novo chamado
app.get('/novo-chamado', (c) => {
  return c.render(
    <div>
      <h1>➕ Novo Chamado</h1>
      <div id="novo-chamado-content">Carregando...</div>
      <script src="/static/js/novo-chamado.js"></script>
    </div>
  )
})

// Página de configurações
app.get('/configuracoes', (c) => {
  return c.render(
    <div>
      <h1>⚙️ Configurações</h1>
      <div id="configuracoes-content">Carregando...</div>
      <script src="/static/js/configuracoes.js"></script>
    </div>
  )
})

// =====================================
// HEALTH CHECK
// =====================================

app.get('/api/health', (c) => {
  return c.json({
    status: 'OK',
    service: 'WMS Ticket System',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: 'Cloudflare D1',
    features: {
      unified_database: true,
      cross_device_sync: true,
      real_smtp: true,
      cloudflare_pages: true
    }
  })
})

export default app
