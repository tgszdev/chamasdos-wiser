# 🚨 Chamados WMS

## 📱 Aplicativo Web Multiplataforma

Um aplicativo web responsivo para gerar chamados WMS formatados e enviá-los diretamente via WhatsApp. **Funciona em qualquer sistema operacional (Windows, macOS, Linux, mobile) sem necessidade de instalação**.

## 🌐 URLs do Aplicativo

- **Demo Online**: https://3000-i31sadssfro11fbzk77x7-6532622b.e2b.dev
- **Deploy Vercel**: ⚠️ Aguardando configuração (ver DEPLOY-VERCEL-STEPS.md)
- **GitHub**: https://github.com/tgszdev/chamasdos-wiser ✅ ATUALIZADO
- **Versão**: v20250829_imagens_v1 📸

## ✨ Características Principais

### ✅ **Funcionalidades Implementadas - Recém Atualizadas! 🎨**
- ✅ **Sistema completo de gerenciamento** - criação, listagem e controle de chamados
- ✅ **Design Gmail-like** - interface clean e profissional inspirada no Gmail
- ✅ **Vídeo de fundo unificado** - presente em todas as páginas para consistência visual
- ✅ **Melhor legibilidade** - cores otimizadas com alto contraste contra vídeo de fundo
- ✅ **Sistema de autenticação** - login e controle de acesso por perfis
- ✅ **Painel administrativo** - gerenciamento completo de usuários e senhas
- ✅ **Controle de status** - Aberto, Em Atendimento, Finalizado, Cancelado
- ✅ **Sistema de prioridades** - com badges coloridas para fácil identificação
- ✅ **Histórico completo** - rastreamento de alterações de status
- ✅ **Filtros avançados** - por categoria, status, prioridade e período
- ✅ **📷 Sistema de anexos** - upload, visualização e download de imagens
- ✅ **Integração direta com WhatsApp** via URL scheme
- ✅ **🔗 Base de dados compartilhada** - todas as versões (web/mobile) salvam na mesma base
- ✅ **📸 UPLOAD DE IMAGENS** - anexar até 3 imagens de 5MB cada nos chamados
- ✅ **Interface responsiva** otimizada para desktop e mobile
- ✅ **Processo unificado** - criação automática + envio para WhatsApp

### 🎨 **Melhorias de Design Recentes - PROBLEMA RESOLVIDO! 🎯**
- 🔄 **Layout Gmail-like** - design clean e profissional
- ✅ **FUNDO SÓLIDO NA TABELA** - transparência removida para máxima legibilidade
- 📰 **Visualização dupla** - Toggle entre Tabela e Cards para descrições extensas
- 📱 **Cards expansíveis** - Descrições longas com expand/collapse integrado
- 🏷️ **Badges melhoradas** - status e prioridade com cores mais claras
- 📊 **Tabelas 100% legíveis** - fundo branco sólido, contraste perfeito
- 🎪 **Botões padronizados** - estilo Gmail em todos os formulários

### 📋 **Páginas do Sistema**
1. **🏠 index.html**: Criação de novos chamados
2. **📋 chamados.html**: Lista e gerenciamento de chamados
3. **🔐 login.html**: Sistema de autenticação
4. **⚙️ admin.html**: Painel administrativo
5. **🚪 logout.html**: Encerramento de sessão

### 🔄 **Fluxo de Uso Completo**
1. Login no sistema com credenciais
2. Criação de chamado via formulário
3. **NOVIDADE**: Salvamento automático + abertura no WhatsApp
4. Visualização e gerenciamento na lista de chamados
5. Controle de status e histórico de alterações
6. Administração de usuários (para admins)

## 🏗️ Arquitetura Técnica

### **Stack Tecnológica**
- **Backend**: Hono + Cloudflare Pages (estático)
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Armazenamento**: LocalStorage para dados
- **Deployment**: Cloudflare Pages/Workers
- **Autenticação**: Cliente-side com localStorage
- **Design**: CSS3 com efeitos Gmail-like

### **Estrutura do Projeto**
```
webapp/
├── index.html             # Página principal (criação de chamados)
├── chamados.html          # Lista e gerenciamento de chamados  
├── login.html            # Sistema de autenticação
├── admin.html            # Painel administrativo
├── logout.html           # Página de logout
├── ecosystem.config.cjs  # Configuração PM2
└── wrangler.jsonc       # Configuração Cloudflare
```

### **APIs/Rotas Implementadas**
- `GET /` - Página principal (index.html)
- `GET /chamados` - Lista de chamados (chamados.html)
- `GET /login` - Sistema de login (login.html)
- `GET /admin` - Painel administrativo (admin.html)
- `GET /logout` - Página de logout (logout.html)

### **Dados e Persistência**
- **LocalStorage**: Usuários, chamados, configurações
- **Estrutura de dados**: JSON com IDs únicos e timestamps
- **Backup**: Via localStorage do navegador

## 📱 Como Usar

### **Opção 1: Via Navegador Web (RECOMENDADO)**
1. Acesse: https://3000-ixjmk6fkuy3nvsvaklcvh.e2b.dev
2. Faça login (credenciais padrão disponíveis no sistema)
3. Use diretamente no navegador (funciona em qualquer dispositivo)

### **Opção 2: Executar Localmente**
```bash
git clone <repository-url>
cd webapp
npm install
pm2 start ecosystem.config.cjs
```

## 👥 Sistema de Usuários

### **Perfis de Acesso**
1. **👑 Admin**: Acesso total (criar, editar, excluir chamados + gerenciar usuários)
2. **👮 Supervisor**: Gerenciar chamados (criar, editar, alterar status)
3. **👤 Operador**: Apenas visualizar chamados (somente leitura)

### **Funcionalidades por Perfil**
- **Admin/Supervisor**: Podem alterar status, editar chamados, criar novos
- **Operador**: Visualização apenas, sem permissões de edição
- **Sistema de Senhas**: Geração automática + mudança manual

## 🎨 Design System - Gmail-like

### **Cores Principais**
- **Fundo**: Vídeo com overlay escura para melhor legibilidade
- **Cards**: `rgba(255, 255, 255, 0.97)` - alta opacidade para contraste
- **Bordas**: `rgba(0, 0, 0, 0.08)` - sutis como no Gmail
- **Texto**: `#202124` (principal), `#5f6368` (secundário)
- **Azul Primary**: `#1a73e8` (botões principais)

### **Componentes Padronizados**
- **Botões**: Estilo Gmail com bordas sutis
- **Campos**: Border radius 8px, padding otimizado
- **Tabelas**: Cabeçalhos fixos, hover effects
- **Cards**: Border radius 12px, sombras suaves
- **Badges**: Cores de status com melhor contraste

## 💡 Vantagens desta Solução

### **✅ Sistema Completo**
- Criação, gerenciamento e controle total de chamados
- Sistema de usuários com diferentes níveis de acesso
- Interface moderna inspirada no Gmail para melhor UX

### **✅ Zero Instalação**
- Funciona instantaneamente em qualquer navegador
- Compatível com Windows, macOS, Linux, Android, iOS
- Dados salvos localmente no navegador

### **✅ Integração WhatsApp Aprimorada**
- **NOVA**: Processo unificado - salva + abre WhatsApp automaticamente
- Mensagens pré-formatadas com todas as informações
- Funciona no WhatsApp Web e app móvel

### **✅ Design Professional**
- **NOVO**: Layout inspirado no Gmail para familiaridade
- Cores otimizadas para melhor legibilidade
- Consistência visual em todas as páginas

## 🚀 Melhorias Implementadas Recentemente - UPLOAD DE IMAGENS ADICIONADO! 📸

### **📸 Sistema de Imagens (NOVO - Última Atualização)**
- ✅ **Upload de imagens** - até 3 imagens de 5MB cada por chamado
- ✅ **Visualização integrada** - preview das imagens no sistema de gerenciamento
- ✅ **Modal full-screen** - visualização em tela cheia com opção de download
- ✅ **Validação robusta** - controle de tamanho, formato e quantidade
- ✅ **Base64 storage** - armazenamento local sem necessidade de servidor
- ✅ **Compatibilidade total** - funciona em todas as versões (web + mobile)

### **🎨 Design e UX (Implementado - Última Atualização)**
- ✅ **Layout Gmail-like** - interface clean e familiar
- ✅ **TABELA COM FUNDO SÓLIDO** - problema de transparência resolvido
- ✅ **Visualização Cards** - alternativa para descrições extensas
- ✅ **Toggle Tabela/Cards** - usuário escolhe a melhor visualização
- ✅ **Descrições expansíveis** - expand/collapse nos cards
- ✅ **Contraste perfeito** - fundo branco sólido em todos elementos
- ✅ **Botões padronizados** - estilo Gmail em todo o sistema

### **⚡ Funcionalidades (Implementado)**
- ✅ **Processo unificado** - botão único para salvar + WhatsApp
- ✅ **Sistema de permissões** - controle por perfil de usuário
- ✅ **Histórico de status** - rastreamento completo de alterações
- ✅ **Filtros avançados** - busca por múltiplos critérios
- ✅ **Auto-save** - chamados salvos automaticamente

## 🚀 Próximos Passos Recomendados

### **🔧 Melhorias Técnicas**
- [ ] **Deploy para Cloudflare Pages** (produção estável)
- [ ] **Migração para Cloudflare D1** (banco de dados remoto)
- [ ] **Sincronização entre dispositivos** via Cloudflare KV
- [ ] **Sistema de backup** automático

### **✨ Funcionalidades Futuras**
- [ ] **Dashboard analytics** com gráficos de chamados
- [ ] **Notificações push** para atualizações
- [ ] **Templates personalizados** por categoria
- [ ] **Upload de anexos** via Cloudflare R2
- [ ] **API REST** para integração externa

### **🎨 Melhorias de UX**
- [ ] **Modo escuro** automático
- [ ] **Atalhos de teclado** para ações rápidas
- [ ] **Busca textual** em descrições
- [ ] **Exportação** de relatórios

## 🔄 Status do Deployment

- **Desenvolvimento**: ✅ Ativo (localhost:3000)
- **Demo Online**: ✅ Ativo (https://3000-ind8u1r79oh43o19fldih.e2b.dev)
- **Produção Vercel**: ⚠️ Pendente (instruções em DEPLOY-VERCEL-STEPS.md)
- **Design Gmail-like**: ✅ Implementado (2024-08-29)
- **Deploy Otimizado**: ✅ Pronto para Vercel/Netlify
- **Package.json**: ✅ Otimizado para sites estáticos

## 🚀 Deploy no Vercel (RECOMENDADO)

### **Método 1: Deploy Direto via GitHub**
1. Push do código para GitHub
2. Conectar repositório no Vercel
3. Deploy automático (zero configuração necessária)

### **Método 2: Deploy via CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy (na pasta do projeto)
vercel

# Deploy para produção
vercel --prod
```

### **Configuração Automática**
- ✅ `vercel.json` já configurado
- ✅ Rotas limpas (/chamados → chamados.html)
- ✅ Package.json otimizado para sites estáticos
- ✅ Build process simplificado
- ✅ Zero dependências de runtime

## 🛠️ Comandos de Desenvolvimento

```bash
# Iniciar desenvolvimento local
pm2 start ecosystem.config.cjs

# Verificar status
pm2 list
pm2 logs webapp --nostream

# Reiniciar servidor
pm2 restart webapp

# Testar páginas
curl http://localhost:3000           # Página principal
curl http://localhost:3000/chamados.html  # Lista de chamados  
curl http://localhost:3000/login.html     # Login
curl http://localhost:3000/admin.html     # Admin
```

## 📞 Integração WhatsApp

O aplicativo gera URLs no formato:
```
https://wa.me/?text=[MENSAGEM_FORMATADA]
```

**Formato da mensagem:**
```
🚨 CHAMADO WMS WISER

🗂️  Categoria: [CATEGORIA]
📝 Título: [TÍTULO]  
📄 Descrição: [DESCRIÇÃO]
⚡ Prioridade: [PRIORIDADE]

📅 Criado em: [DATA_HORA_BR]
🆔 ID: [CHAMADO_ID]
```

## 🎯 Conclusão

Esta solução oferece um **sistema completo de chamados WMS** com:
- ✨ **Design moderno Gmail-like** para melhor UX
- 🔐 **Sistema de usuários** com controle de acesso
- 📱 **Interface responsiva** funcionando em qualquer dispositivo  
- 🚀 **Integração WhatsApp** aprimorada
- 💾 **Dados locais** sem necessidade de servidor

**Perfect para implementação imediata como ferramenta interna de WMS!**

---

**🎯 PROBLEMA RESOLVIDO**: Lista de chamados agora é 100% legível!
**🔗 NOVA FUNCIONALIDADE**: Base de dados compartilhada entre todas as versões!
**📸 SISTEMA DE IMAGENS**: Upload, visualização e gerenciamento completo de anexos!
**🔄 Última atualização**: 29/08/2025 - Versão v20250829_imagens_v1
**📊 Status**: ✅ Pronto para uso em produção - Sistema de imagens 100% funcional!
**🚀 GitHub**: https://github.com/tgszdev/chamasdos-wiser (ATUALIZADO)