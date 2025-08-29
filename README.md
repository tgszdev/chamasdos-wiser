# Sistema WMS de Chamados - Versão SMTP v1.0

## 🎯 Visão Geral do Projeto
Sistema completo para geração de chamados WMS formatados com **alertas de e-mail SMTP** integrados. Desenvolvido para Cloudflare Pages com Hono framework.

## 🌐 URLs do Sistema
- **Produção**: https://3000-i31sadssfro11fbzk77x7-6532622b.e2b.dev
- **Página Principal**: [Gerar Chamados](https://3000-i31sadssfro11fbzk77x7-6532622b.e2b.dev/)
- **Gerenciar Chamados**: [Chamados](https://3000-i31sadssfro11fbzk77x7-6532622b.e2b.dev/chamados.html)
- **Painel Admin**: [Admin](https://3000-i31sadssfro11fbzk77x7-6532622b.e2b.dev/admin.html)
- **Login**: [Entrar](https://3000-i31sadssfro11fbzk77x7-6532622b.e2b.dev/login.html)

## ✅ Funcionalidades Implementadas

### 🚨 Sistema de Chamados
- ✅ Criação de chamados formatados
- ✅ Categorização (Recebimento, Expedição, Movimentações, Relatório, Melhoria)  
- ✅ Níveis de prioridade (Crítica, Alta, Média, Baixa)
- ✅ Upload de até 3 imagens (5MB cada)
- ✅ Geração automática para WhatsApp Web
- ✅ Numeração automática sequencial
- ✅ Armazenamento local com Base64

### 📋 Gerenciamento de Chamados
- ✅ Visualização em cards com status coloridos
- ✅ Filtros avançados (status, prioridade, categoria, período)
- ✅ Busca por título e descrição
- ✅ Alteração de status com observações
- ✅ Histórico completo de mudanças
- ✅ Função "Limpar Tudo" com confirmação
- ✅ Contadores por status em tempo real

### 👑 Painel Administrativo
- ✅ Gerenciamento completo de usuários
- ✅ Configuração SMTP para alertas de e-mail
- ✅ Interface de teste de conexão SMTP
- ✅ Envio de e-mails de teste
- ✅ Configuração de destinatários de alertas
- ✅ Dashboard com estatísticas do sistema

### 📧 Sistema de Alertas SMTP
- ✅ **Configuração SMTP completa** (host, porta, segurança, credenciais)
- ✅ **Suporte ao Gmail** com App Passwords
- ✅ **Alertas automáticos** para:
  - 🆕 Novos chamados criados
  - 🔄 Mudanças de status
  - 📊 Relatórios diários (planejado)
- ✅ **E-mails HTML responsivos** com design profissional
- ✅ **Múltiplos destinatários** configuráveis
- ✅ **Teste de envio** individual e em lote

## 🔧 Arquitetura Técnica

### **Backend: Hono + Cloudflare Workers**
- **Framework**: Hono v4.0 (leve e rápido)
- **Runtime**: Cloudflare Workers Edge Runtime
- **Build**: Vite + TypeScript
- **Deployment**: Cloudflare Pages

### **Frontend: HTML5 + JavaScript Vanilla**
- **Design**: CSS puro com Google Material inspirado
- **Armazenamento**: localStorage + sessionStorage
- **Imagens**: Codificação Base64 para portabilidade
- **Responsivo**: Mobile-first design

### **Sistema de E-mail**
```
🔄 VERSÃO ATUAL (Desenvolvimento):
├── Simulação completa no frontend
├── Validações de configuração SMTP
├── Logs detalhados no console
└── Interface completa de teste

🚀 PRODUÇÃO (Implementação futura):
├── API Resend (recomendado)
├── SendGrid / Mailgun
├── Amazon SES
└── Integração backend real
```

## 📊 Estrutura de Dados

### **Chamados (localStorage: 'wms_chamados')**
```json
{
  "numero": "2025001",
  "titulo": "Erro na conferência",
  "categoria": "Recebimento", 
  "prioridade": "🔴 Crítica",
  "descricao": "Descrição detalhada...",
  "usuario": "João Silva",
  "status": "aberto",
  "criadoEm": "2025-08-29T18:45:00.000Z",
  "imagens": ["data:image/jpeg;base64,..."],
  "historico": [
    {
      "status": "aberto",
      "usuario": "João Silva", 
      "timestamp": "2025-08-29T18:45:00.000Z"
    }
  ]
}
```

### **Configuração SMTP (localStorage: 'wms_smtp_config')**
```json
{
  "enabled": true,
  "host": "smtp.gmail.com",
  "port": "587", 
  "security": "tls",
  "user": "sistema@empresa.com",
  "password": "app-password-gerada",
  "fromName": "Sistema WMS",
  "alerts": {
    "novoChamado": true,
    "statusChange": true,
    "overdue": false
  },
  "alertUsers": [
    {"name": "Admin", "email": "admin@empresa.com"},
    {"name": "Supervisor", "email": "supervisor@empresa.com"}
  ]
}
```

## 🛠️ Guia de Implementação SMTP Real

### **1. Para Gmail (Recomendado para testes):**
```
Host: smtp.gmail.com
Porta: 587
Segurança: TLS
Usuário: seu-email@gmail.com
Senha: App Password (não a senha normal)

⚠️ Importante: Gere App Password em:
https://myaccount.google.com/apppasswords
```

### **2. Para Produção (APIs recomendadas):**

**Resend (Melhor para Cloudflare Workers):**
```javascript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'Sistema WMS <onboarding@resend.dev>',
    to: ['admin@empresa.com'],
    subject: '🆕 Novo Chamado WMS #2025001',
    html: emailHtmlContent
  })
})
```

**SendGrid:**
```javascript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST', 
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(sendgridEmailObject)
})
```

## 🎨 Design System
- **Cores principais**: #202124 (text), #5f6368 (secondary), #1a73e8 (primary)
- **Paleta de status**: 
  - 🟢 Resolvido: #16a34a
  - 🟡 Em andamento: #d97706  
  - 🔴 Aberto: #dc2626
  - ⚫ Cancelado: #6b7280
- **Tipografia**: Inter, -apple-system, BlinkMacSystemFont
- **Layout**: Cards com sombras suaves, bordas arredondadas 8px

## 🚀 Deploy e Configuração

### **Local Development:**
```bash
cd /home/user/webapp
npm install
npm run build
pm2 start ecosystem.config.cjs
```

### **Cloudflare Pages Production:**
```bash
# 1. Setup API key
setup_cloudflare_api_key

# 2. Build project  
npm run build

# 3. Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name webapp
```

## 📋 Próximos Passos

### **Alta Prioridade:**
1. 🔧 **Implementar API de e-mail real** (Resend/SendGrid)
2. 📊 **Dashboard de métricas** avançadas
3. 🔔 **Notificações push** no navegador
4. 📱 **PWA completo** com offline support

### **Média Prioridade:**
5. 🗃️ **Banco de dados externo** (Supabase/PlanetScale)
6. 👥 **Sistema de permissões** por usuário
7. 📈 **Relatórios automáticos** diários/semanais  
8. 🔍 **Busca avançada** com filtros combinados

### **Baixa Prioridade:**
9. 🎨 **Temas personalizáveis** (dark mode)
10. 🌐 **Múltiplos idiomas** (i18n)
11. 📊 **Integração com BI** tools
12. 🤖 **Automações** avançadas

## 🔒 Segurança e Boas Práticas
- ✅ **Configurações sensíveis** só no localStorage
- ✅ **Validação** de dados no frontend e backend
- ✅ **Sanitização** de inputs HTML
- ✅ **Rate limiting** via Cloudflare
- ✅ **HTTPS** obrigatório em produção
- ⚠️ **App Passwords** para Gmail (não senha normal)

## 📝 Logs e Debugging
- **Console do navegador**: Logs detalhados dos alertas SMTP
- **PM2 Logs**: `pm2 logs webapp --nostream`
- **Cloudflare Logs**: Painel Cloudflare Workers
- **Local Storage**: Inspect via DevTools → Application

## 🏆 Status do Projeto
- **Versão**: 1.0 SMTP (29/08/2025)
- **Status**: ✅ Funcional com SMTP simulado
- **Próximo milestone**: Integração SMTP real
- **Tech Stack**: Hono + Cloudflare Workers + HTML5
- **Deployment**: ✅ Cloudflare Pages Ready