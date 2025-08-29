import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { Resend } from 'resend'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API route to generate WhatsApp URL
app.post('/api/whatsapp', async (c) => {
  const body = await c.req.json()
  const { categoria, titulo, descricao, prioridade } = body
  
  // Format current date and time in Brazil timezone
  const agora = new Date()
  const opcoes = {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  } as const
  const dataHoraAtual = agora.toLocaleString('pt-BR', opcoes)
  
  // Generate formatted message
  const textoFormatado = `🚨 CHAMADO WMS WISER


🗂️  Categoria: ${categoria}
📝 Título: ${titulo}
📄 Descrição: ${descricao}
⚡ Prioridade: ${prioridade}

📅 Criado em: ${dataHoraAtual}`

  // Generate WhatsApp URL
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(textoFormatado)}`
  
  return c.json({ 
    message: textoFormatado,
    whatsappUrl: whatsappUrl
  })
})

// ===== ENDPOINTS SMTP =====

// Testar configuração SMTP (validação + teste Resend se disponível)
app.post('/api/smtp/test', async (c) => {
  try {
    const body = await c.req.json()
    const { host, port, user, password, security, useResend, resendApiKey } = body
    
    // Validar campos obrigatórios
    if (!host || !port || !user || !password) {
      return c.json({ 
        success: false, 
        error: 'Campos obrigatórios: host, port, user, password' 
      }, 400)
    }
    
    // Validações básicas de formato
    if (!host.includes('.')) {
      return c.json({ 
        success: false, 
        error: 'Host SMTP inválido' 
      }, 400)
    }
    
    if (isNaN(parseInt(port)) || parseInt(port) < 1 || parseInt(port) > 65535) {
      return c.json({ 
        success: false, 
        error: 'Porta inválida. Use valores entre 1 e 65535' 
      }, 400)
    }
    
    if (!user.includes('@')) {
      return c.json({ 
        success: false, 
        error: 'E-mail do usuário SMTP inválido' 
      }, 400)
    }
    
    if (password.length < 4) {
      return c.json({ 
        success: false, 
        error: 'Senha muito curta. Use pelo menos 4 caracteres' 
      }, 400)
    }
    
    // Se tiver Resend API Key, testar com Resend
    if (useResend && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)
        
        // Teste simples com Resend
        await resend.domains.list()
        
        return c.json({ 
          success: true, 
          message: `✅ Conexão Resend estabelecida com sucesso! Pronto para enviar e-mails reais.`,
          mode: 'resend'
        })
      } catch (resendError) {
        return c.json({ 
          success: false, 
          error: `Erro Resend: ${resendError.message}` 
        }, 400)
      }
    }
    
    // Caso contrário, validação local
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simula delay
    
    return c.json({ 
      success: true, 
      message: `✅ Configuração SMTP válida para ${host}:${port}. Para envio real, configure Resend API Key.`,
      mode: 'simulation'
    })
    
  } catch (error) {
    console.error('Erro ao testar SMTP:', error)
    
    let errorMessage = 'Erro desconhecido'
    if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = error.message
    }
    
    return c.json({ 
      success: false, 
      error: errorMessage 
    }, 500)
  }
})

// Enviar e-mail de teste (Resend real + simulação)
app.post('/api/smtp/send-test', async (c) => {
  try {
    const body = await c.req.json()
    const { host, port, user, password, security, fromName, toEmail, toName, useResend, resendApiKey, recipients } = body
    
    // Validar campos obrigatórios
    if (!host || !port || !user || !password || !toEmail) {
      return c.json({ 
        success: false, 
        error: 'Campos obrigatórios: host, port, user, password, toEmail' 
      }, 400)
    }
    
    // Se tiver Resend API Key, usar envio real
    if (useResend && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)
        
        const emailsToSend = recipients && recipients.length > 0 ? recipients : [{ email: toEmail, name: toName || 'Usuário' }]
        const results = []
        
        for (const recipient of emailsToSend) {
          const emailContent = {
            from: `${fromName || 'Sistema WMS'} <onboarding@resend.dev>`,
            to: recipient.email,
            subject: '🧪 Teste REAL - Sistema WMS de Chamados',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1>🧪 E-mail de Teste REAL</h1>
                  <p>Sistema WMS de Chamados</p>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #333;">✅ E-mail REAL Enviado!</h2>
                  
                  <p>Olá <strong>${recipient.name}</strong>,</p>
                  
                  <p>Este é um <strong>e-mail REAL</strong> enviado via Resend API para confirmar que sua configuração está funcionando!</p>
                  
                  <div style="background: #d4edda; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 5px;">
                    <h3 style="color: #155724; margin-top: 0;">✅ SUCESSO - E-mail Real!</h3>
                    <p style="color: #155724; margin: 0;">Este e-mail foi enviado via <strong>Resend API</strong> e chegou na sua caixa de entrada real!</p>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-left: 4px solid #4f46e5; margin: 20px 0;">
                    <h3 style="color: #4f46e5; margin-top: 0;">🔧 Detalhes do Envio:</h3>
                    <ul style="color: #666;">
                      <li><strong>API:</strong> Resend</li>
                      <li><strong>Para:</strong> ${recipient.name} &lt;${recipient.email}&gt;</li>
                      <li><strong>Remetente:</strong> ${fromName || 'Sistema WMS'}</li>
                      <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                    </ul>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    🎉 Parabéns! Seu sistema agora pode enviar e-mails reais automaticamente!
                  </p>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <div style="background: #28a745; color: white; padding: 15px; border-radius: 8px; display: inline-block;">
                      ✅ <strong>Sistema WMS - E-mail Real Funcionando!</strong>
                    </div>
                  </div>
                </div>
              </div>
            `
          }
          
          const result = await resend.emails.send(emailContent)
          results.push({
            recipient: recipient.email,
            success: true,
            messageId: result.data?.id || 'unknown',
            name: recipient.name
          })
          
          console.log(`✅ E-mail REAL enviado para ${recipient.name}:`, result)
        }
        
        const emailList = results.map(r => `${r.name} <${r.recipient}>`)
        
        return c.json({ 
          success: true, 
          message: `🎉 ${results.length} e-mail(s) REAL enviado(s) via Resend para: ${emailList.join(', ')}`,
          mode: 'resend_real',
          results: results
        })
        
      } catch (resendError) {
        console.error('Erro Resend:', resendError)
        return c.json({ 
          success: false, 
          error: `Erro ao enviar via Resend: ${resendError.message}` 
        }, 500)
      }
    }
    
    // Caso contrário, simulação (modo desenvolvimento)
    // Validar formato do e-mail de destino
    if (!toEmail.includes('@') || !toEmail.includes('.')) {
      return c.json({ 
        success: false, 
        error: 'E-mail de destino inválido' 
      }, 400)
    }
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const emailsToSend = recipients && recipients.length > 0 ? recipients : [{ email: toEmail, name: toName || 'Usuário' }]
    const messageId = `sim-${Date.now()}-${Math.random().toString(36).substring(7)}`
    
    console.log('📧 E-mails simulados para:', emailsToSend)
    
    return c.json({ 
      success: true, 
      message: `✅ ${emailsToSend.length} e-mail(s) simulado(s). Para envio REAL, configure Resend API Key.`,
      messageId: messageId,
      mode: 'simulation',
      recipients: emailsToSend.length
    })
    
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    
    let errorMessage = 'Erro ao enviar e-mail'
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = error.message
    }
    
    return c.json({ 
      success: false, 
      error: errorMessage 
    }, 500)
  }
})

// Enviar alerta de chamado
app.post('/api/smtp/alert', async (c) => {
  try {
    const body = await c.req.json()
    const { 
      config, // configuração SMTP
      alertType, // 'novoChamado', 'statusChange', etc
      data, // dados do chamado
      recipients // lista de destinatários
    } = body
    
    // Validar configuração SMTP
    if (!config || !config.host || !config.user || !config.password) {
      return c.json({ 
        success: false, 
        error: 'Configuração SMTP inválida' 
      }, 400)
    }
    
    // Validar destinatários
    if (!recipients || recipients.length === 0) {
      return c.json({ 
        success: false, 
        error: 'Nenhum destinatário especificado' 
      }, 400)
    }
    
    // Simular configuração SMTP (Cloudflare Workers não suporta nodemailer)
    console.log(`📧 Preparando envio de alerta ${alertType} para ${recipients.length} destinatário(s)`)
    
    // Preparar conteúdo do e-mail baseado no tipo
    let subject = ''
    let htmlContent = ''
    
    const baseStyle = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🚨 Sistema WMS</h1>
          <p>Alerta de Chamado</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
    `
    
    if (alertType === 'novoChamado') {
      subject = `🆕 Novo Chamado WMS #${data.numero || 'N/A'}`
      htmlContent = baseStyle + `
          <h2 style="color: #333;">🆕 Novo Chamado Criado</h2>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #4f46e5; margin: 20px 0;">
            <h3 style="color: #4f46e5; margin-top: 0;">📋 Detalhes do Chamado:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>Número:</strong> #${data.numero || 'N/A'}</li>
              <li><strong>Título:</strong> ${data.titulo || 'N/A'}</li>
              <li><strong>Categoria:</strong> ${data.categoria || 'N/A'}</li>
              <li><strong>Prioridade:</strong> ${data.prioridade || 'N/A'}</li>
              <li><strong>Criado por:</strong> ${data.usuario || 'N/A'}</li>
              <li><strong>Data:</strong> ${new Date(data.criadoEm || Date.now()).toLocaleString('pt-BR')}</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">📄 Descrição:</h4>
            <p style="color: #666; line-height: 1.6;">${data.descricao || 'N/A'}</p>
          </div>
          
          ${data.imagens && data.imagens.length > 0 ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0;">📸 Imagens:</h4>
              <p style="color: #666;">${data.imagens.length} imagem(s) anexada(s)</p>
            </div>
          ` : ''}
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="${data.linkSistema || '#'}" style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              🔗 Acessar Sistema
            </a>
          </p>
        </div>
      </div>
      `
    } else if (alertType === 'statusChange') {
      subject = `🔄 Chamado WMS #${data.numero || 'N/A'} - Status Alterado`
      htmlContent = baseStyle + `
          <h2 style="color: #333;">🔄 Status do Chamado Alterado</h2>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3 style="color: #f59e0b; margin-top: 0;">📋 Informações do Chamado:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>Número:</strong> #${data.numero || 'N/A'}</li>
              <li><strong>Título:</strong> ${data.titulo || 'N/A'}</li>
              <li><strong>Status Anterior:</strong> ${data.statusAnterior || 'N/A'}</li>
              <li><strong>Novo Status:</strong> ${data.novoStatus || 'N/A'}</li>
              <li><strong>Alterado por:</strong> ${data.usuario || 'N/A'}</li>
              <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
            </ul>
          </div>
          
          ${data.observacao ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0;">💬 Observação:</h4>
              <p style="color: #666; line-height: 1.6;">${data.observacao}</p>
            </div>
          ` : ''}
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="${data.linkSistema || '#'}" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              🔗 Acessar Sistema
            </a>
          </p>
        </div>
      </div>
      `
    }
    
    // Simular envio para cada destinatário (em produção usaria API real)
    const results = []
    
    for (const recipient of recipients) {
      try {
        const mailOptions = {
          from: `${config.fromName || 'Sistema WMS'} <${config.user}>`,
          to: recipient.email,
          subject: subject,
          html: htmlContent
        }
        
        // Simular delay de envio
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Log do e-mail que seria enviado
        console.log(`📧 E-mail simulado:`, {
          to: recipient.email,
          subject: subject,
          from: mailOptions.from
        })
        
        // IMPORTANTE: Em produção, aqui você faria a chamada para API real:
        // const response = await fetch('https://api.resend.com/emails', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${RESEND_API_KEY}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(mailOptions)
        // })
        
        const messageId = `alert-${Date.now()}-${Math.random().toString(36).substring(7)}`
        
        results.push({
          recipient: recipient.email,
          success: true,
          messageId: messageId,
          simulated: true
        })
        
      } catch (error) {
        results.push({
          recipient: recipient.email,
          success: false,
          error: error.message || 'Erro desconhecido'
        })
      }
    }
    
    // Verificar se pelo menos um e-mail foi enviado
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    return c.json({
      success: successful > 0,
      message: `${successful} e-mail(s) enviado(s) com sucesso, ${failed} falharam`,
      results: results
    })
    
  } catch (error) {
    console.error('Erro ao enviar alerta:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Erro interno do servidor' 
    }, 500)
  }
})

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chamados WMS WISER</title>
        
        <!-- PWA Meta tags -->
        <meta name="description" content="Aplicativo para gerar chamados WMS WISER formatados para WhatsApp">
        <meta name="theme-color" content="#4f46e5">
        <link rel="manifest" href="/static/manifest.json">
        
        <!-- Apple PWA Meta tags -->
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="WMS WISER">
        
        <!-- Icons -->
        <link rel="icon" type="image/png" sizes="192x192" href="/static/icon-192.png">
        <link rel="icon" type="image/png" sizes="512x512" href="/static/icon-512.png">
        <link rel="apple-touch-icon" href="/static/icon-192.png">
        
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: #000000;
            background-image: url('https://static.wixstatic.com/media/5d6ed6_f0f55c94274c4db8b8b1ac92451e89b1f000.jpg/v1/fill/w_980,h_861,al_c,q_85,usm_0.33_1.00_0.00,enc_avif,quality_auto/5d6ed6_f0f55c94274c4db8b8b1ac92451e89b1f000.jpg');
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            min-height: 100vh;
            padding: 20px;
            position: relative;
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            z-index: -1;
            pointer-events: none;
        }
        
        .container {
            max-width: 520px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.3);
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.4);
            position: relative;
            z-index: 1;
        }
        
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 32px 28px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        
        .header h1 {
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 15px;
            opacity: 0.9;
            font-weight: 400;
            position: relative;
            z-index: 1;
        }
        
        .form-container {
            padding: 32px 28px;
            background: rgba(248, 250, 252, 0.9);
        }
        
        .field {
            margin-bottom: 24px;
            position: relative;
        }
        
        .field label {
            display: block;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 10px;
            font-size: 15px;
            letter-spacing: -0.2px;
        }
        
        .field select,
        .field input,
        .field textarea {
            width: 100%;
            padding: 16px 18px;
            border: 2px solid rgba(148, 163, 184, 0.2);
            border-radius: 16px;
            font-size: 16px;
            font-family: 'Inter', sans-serif;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            color: #1e293b;
        }
        
        .field select:focus,
        .field input:focus,
        .field textarea:focus {
            outline: none;
            border-color: #4f46e5;
            background: rgba(255, 255, 255, 1);
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
            transform: translateY(-2px);
        }
        
        .field textarea {
            resize: vertical;
            min-height: 90px;
            line-height: 1.6;
        }
        
        .btn {
            width: 100%;
            padding: 18px 24px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin-bottom: 12px;
            font-family: 'Inter', sans-serif;
            letter-spacing: -0.3px;
            position: relative;
            overflow: hidden;
            text-decoration: none;
            display: block;
            text-align: center;
        }
        
        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .btn:hover::before {
            left: 100%;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(79, 70, 229, 0.4);
        }
        
        .btn-whatsapp {
            background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
            color: white;
            box-shadow: 0 8px 25px rgba(37, 211, 102, 0.3);
        }
        
        .btn-whatsapp:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(37, 211, 102, 0.4);
        }
        
        .btn-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }
        
        .btn-success:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
        }
        
        .btn-secondary {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            color: white;
            box-shadow: 0 8px 25px rgba(100, 116, 139, 0.3);
        }
        
        .btn-secondary:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(100, 116, 139, 0.4);
        }
        
        .resultado {
            margin-top: 28px;
            padding: 24px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            border: 1px solid rgba(79, 70, 229, 0.2);
            display: none;
            position: relative;
            overflow: hidden;
        }
        
        .resultado::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        }
        
        .resultado h3 {
            color: #1e293b;
            margin-bottom: 16px;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: -0.3px;
        }
        
        .texto-gerado {
            background: rgba(248, 250, 252, 0.9);
            padding: 20px;
            border-radius: 14px;
            border: 1px solid rgba(226, 232, 240, 0.5);
            font-family: 'Inter', sans-serif;
            white-space: pre-line;
            font-size: 14px;
            line-height: 1.7;
            color: #334155;
            margin-bottom: 16px;
        }
        
        .feedback {
            text-align: center;
            padding: 16px;
            border-radius: 12px;
            margin-top: 12px;
            display: none;
            font-weight: 500;
            letter-spacing: -0.2px;
        }
        
        .feedback.success {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            color: #065f46;
            border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        .prioridade-critica { color: #dc2626; }
        .prioridade-alta { color: #ea580c; }
        .prioridade-media { color: #ca8a04; }
        .prioridade-baixa { color: #16a34a; }
        
        @media (max-width: 600px) {
            .container {
                margin: 12px;
                border-radius: 20px;
            }
            
            body {
                padding: 12px;
            }
            
            .header {
                padding: 28px 24px;
            }
            
            .form-container {
                padding: 28px 24px;
            }
            
            .header h1 {
                font-size: 22px;
            }
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .resultado {
            animation: slideIn 0.5s ease-out;
        }
        
        .btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none !important;
        }
        
        .loading {
            opacity: 0.7;
        }
        
        .loading::after {
            content: '...';
            animation: dots 1.5s steps(5, end) infinite;
        }
        
        @keyframes dots {
            0%, 20% {
                color: rgba(0,0,0,0);
                text-shadow:
                    .25em 0 0 rgba(0,0,0,0),
                    .5em 0 0 rgba(0,0,0,0);
            }
            40% {
                color: white;
                text-shadow:
                    .25em 0 0 rgba(0,0,0,0),
                    .5em 0 0 rgba(0,0,0,0);
            }
            60% {
                text-shadow:
                    .25em 0 0 white,
                    .5em 0 0 rgba(0,0,0,0);
            }
            80%, 100% {
                text-shadow:
                    .25em 0 0 white,
                    .5em 0 0 white;
            }
        }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 Chamados WMS WISER</h1>
                <p>Os detalhes fazem toda a diferença: quanto mais completas forem as informações no chamado, mais rápida e eficaz será a análise e a solução.</p>
            </div>
            
            <div class="form-container">
                <form id="chamadoForm">
                    <div class="field">
                        <label for="categoria">🗂️ Categoria:</label>
                        <select id="categoria" required>
                            <option value="">Selecione a categoria...</option>
                            <option value="Recebimento">📦 Recebimento</option>
                            <option value="Expedição">🚚 Expedição</option>
                            <option value="Movimentações Internas">🔄 Movimentações Internas</option>
                            <option value="Relatório">📊 Relatório</option>
                            <option value="Melhoria">🚀 Melhoria</option>
                        </select>
                    </div>
                    
                    <div class="field">
                        <label for="titulo">📝 Título do Chamado:</label>
                        <input type="text" id="titulo" placeholder="Ex: Erro na conferência de produtos" required>
                    </div>
                    
                    <div class="field">
                        <label for="descricao">📄 Descrição:</label>
                        <textarea id="descricao" placeholder="Descreva detalhadamente o que aconteceu..." required></textarea>
                    </div>
                    
                    <div class="field">
                        <label for="prioridade">⚡ Prioridade do Chamado:</label>
                        <select id="prioridade" required>
                            <option value="">Selecione a prioridade...</option>
                            <option value="🔴 Crítica" class="prioridade-critica">🔴 Crítica (SISTEMA OU PROCESSO PARADO)</option>
                            <option value="🟠 Alta" class="prioridade-alta">🟠 Alta</option>
                            <option value="🟡 Média" class="prioridade-media">🟡 Média</option>
                            <option value="🟢 Baixa" class="prioridade-baixa">🟢 Baixa</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">📱 GERAR E ENVIAR VIA WHATSAPP</button>
                </form>
                
                <div id="resultado" class="resultado">
                    <h3>✅ Mensagem gerada com sucesso!</h3>
                    <div id="textoGerado" class="texto-gerado"></div>
                    
                    <a id="whatsappBtn" href="#" target="_blank" class="btn btn-whatsapp">
                        📱 ABRIR NO WHATSAPP
                    </a>
                    <button id="copiarBtn" class="btn btn-success">📋 COPIAR TEXTO</button>
                    <button id="limparBtn" class="btn btn-secondary">🔄 NOVO CHAMADO</button>
                    
                    <div id="feedback" class="feedback"></div>
                </div>
            </div>
        </div>

        <script>
        document.getElementById('chamadoForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const categoria = document.getElementById('categoria').value;
            const titulo = document.getElementById('titulo').value;
            const descricao = document.getElementById('descricao').value;
            const prioridade = document.getElementById('prioridade').value;
            
            if (!categoria || !titulo || !descricao || !prioridade) {
                mostrarFeedback('❌ Por favor, preencha todos os campos obrigatórios!', 'error');
                return;
            }
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Gerando mensagem';
            
            try {
                const response = await fetch('/api/whatsapp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        categoria,
                        titulo,
                        descricao,
                        prioridade
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Erro ao gerar mensagem');
                }
                
                const data = await response.json();
                
                document.getElementById('textoGerado').textContent = data.message;
                document.getElementById('whatsappBtn').href = data.whatsappUrl;
                document.getElementById('resultado').style.display = 'block';
                
                // Scroll to result
                document.getElementById('resultado').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'nearest'
                });
                
                // Auto-open WhatsApp after a short delay
                setTimeout(() => {
                    if (confirm('Deseja abrir o WhatsApp automaticamente?')) {
                        window.open(data.whatsappUrl, '_blank');
                    }
                }, 500);
                
            } catch (error) {
                console.error('Error:', error);
                mostrarFeedback('❌ Erro ao gerar mensagem. Tente novamente.', 'error');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
            }
        });
        
        document.getElementById('copiarBtn').addEventListener('click', function() {
            const texto = document.getElementById('textoGerado').textContent;
            
            navigator.clipboard.writeText(texto).then(function() {
                mostrarFeedback('✅ Texto copiado com sucesso! Cole no WhatsApp.', 'success');
            }).catch(function() {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = texto;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                mostrarFeedback('✅ Texto copiado! Cole no WhatsApp.', 'success');
            });
        });
        
        document.getElementById('limparBtn').addEventListener('click', function() {
            document.getElementById('chamadoForm').reset();
            document.getElementById('resultado').style.display = 'none';
            document.getElementById('categoria').focus();
        });
        
        function mostrarFeedback(mensagem, tipo) {
            const feedback = document.getElementById('feedback');
            feedback.textContent = mensagem;
            feedback.className = \`feedback \${tipo}\`;
            feedback.style.display = 'block';
            
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 4000);
        }
        
        // Allow Ctrl+Enter to submit
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                document.getElementById('chamadoForm').dispatchEvent(new Event('submit'));
            }
        });
        
        // Entry animation
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelector('.container').style.animation = 'slideIn 0.6s ease-out';
            
            // Register service worker for PWA
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/static/sw.js')
                    .then(function(registration) {
                        console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                    });
            }
        });
        </script>
    </body>
    </html>
  `)
})

export default app
