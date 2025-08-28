# 🚨 Chamados WMS WISER

## 📱 Aplicativo Web Multiplataforma

Um aplicativo web responsivo para gerar chamados WMS WISER formatados e enviá-los diretamente via WhatsApp. **Funciona em qualquer sistema operacional (Windows, macOS, Linux, mobile) sem necessidade de instalação**.

## 🌐 URLs do Aplicativo

- **Demo Online**: https://3000-iqofpibdt6g7bo8j56r7l.e2b.dev
- **GitHub**: *[Será configurado no deploy]*

## ✨ Características Principais

### ✅ **Funcionalidades Implementadas**
- ✅ **Formulário completo** para criação de chamados
- ✅ **Integração direta com WhatsApp** via URL scheme
- ✅ **Interface responsiva** otimizada para desktop e mobile
- ✅ **PWA (Progressive Web App)** - pode ser "instalado" na área de trabalho
- ✅ **Funciona offline** após primeira visita
- ✅ **Cópia automática** do texto formatado
- ✅ **Abertura automática** do WhatsApp (com confirmação)
- ✅ **Validação de campos** em tempo real
- ✅ **Animações suaves** e feedback visual
- ✅ **Design moderno** com glassmorphism

### 📋 **Campos do Formulário**
1. **🗂️ Categoria**: Recebimento, Expedição, Movimentações Internas, Relatório, Melhoria
2. **📝 Título**: Título descritivo do chamado
3. **📄 Descrição**: Detalhamento completo do problema/solicitação
4. **⚡ Prioridade**: Crítica, Alta, Média, Baixa (com cores indicativas)

### 🔄 **Fluxo de Uso**
1. Usuário preenche o formulário
2. Clica em "GERAR E ENVIAR VIA WHATSAPP"
3. Sistema gera mensagem formatada com data/hora brasileira
4. Oferece opção de abrir automaticamente no WhatsApp
5. Permite copiar texto manualmente se necessário
6. Botão para criar novo chamado

## 🏗️ Arquitetura Técnica

### **Stack Tecnológica**
- **Backend**: Hono (TypeScript)
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Deployment**: Cloudflare Pages/Workers
- **PWA**: Service Worker + Manifest
- **Styling**: CSS3 com Glassmorphism

### **Estrutura do Projeto**
```
webapp/
├── src/
│   └── index.tsx          # Aplicação Hono principal
├── public/
│   └── static/
│       ├── manifest.json  # PWA manifest
│       ├── sw.js         # Service Worker
│       ├── icon-*.png    # Ícones do app
│       └── icon.svg      # Ícone fonte
├── ecosystem.config.cjs   # Configuração PM2
└── wrangler.jsonc        # Configuração Cloudflare
```

### **APIs Implementadas**
- `GET /` - Página principal do aplicativo
- `POST /api/whatsapp` - Geração de mensagem e URL do WhatsApp
- `GET /static/*` - Servir arquivos estáticos (ícones, manifest, etc.)

## 📱 Como Usar

### **Opção 1: Via Navegador Web (RECOMENDADO)**
1. Acesse: https://3000-iqofpibdt6g7bo8j56r7l.e2b.dev
2. Use diretamente no navegador (funciona em qualquer dispositivo)

### **Opção 2: "Instalar" como PWA**
1. No Chrome/Edge: Clique no ícone "Instalar app" na barra de endereço
2. No Safari (iOS): Compartilhar > "Adicionar à Tela de Início"
3. No Android: Menu > "Instalar app" ou "Adicionar à tela inicial"

### **Opção 3: Executar Localmente**
```bash
git clone <repository-url>
cd webapp
npm install
npm run build
npm run dev:sandbox
```

## 💡 Vantagens desta Solução

### **✅ Sem Instalação Necessária**
- Funciona instantaneamente em qualquer navegador
- Não requer downloads ou instalações
- Compatível com Windows, macOS, Linux, Android, iOS

### **✅ Integração Nativa com WhatsApp**
- Abre automaticamente o WhatsApp com mensagem pré-formatada
- Funciona no WhatsApp Web e no app móvel
- Preserva formatação e emojis

### **✅ Experiência de App Nativo**
- Interface moderna e responsiva
- Pode ser "instalado" na área de trabalho via PWA
- Funciona offline após primeira visita

### **✅ Manutenção Simplificada**
- Atualizações automáticas via web
- Uma única versão para todas as plataformas
- Deploy instantâneo via Cloudflare

## 🚀 Próximos Passos Recomendados

### **🔧 Melhorias Técnicas**
- [ ] **Deploy para Cloudflare Pages** (produção estável)
- [ ] **Configuração de domínio personalizado** (ex: chamados.wmswiser.com.br)
- [ ] **Analytics de uso** para monitoramento
- [ ] **Backup automático** de dados via Cloudflare D1

### **✨ Funcionalidades Futuras**
- [ ] **Histórico de chamados** salvos localmente
- [ ] **Templates personalizados** para diferentes tipos de chamado
- [ ] **Upload de imagens/anexos** via Cloudflare R2
- [ ] **Notificações push** para atualizações de chamado
- [ ] **Integração com sistema interno** via API

### **🎨 Melhorias de UX**
- [ ] **Modo escuro** automático
- [ ] **Atalhos de teclado** para preenchimento rápido
- [ ] **Sugestões inteligentes** baseadas no histórico
- [ ] **Validação avançada** de campos

## 🔄 Status do Deployment

- **Desenvolvimento**: ✅ Ativo (localhost:3000)
- **Demo Online**: ✅ Ativo (https://3000-iqofpibdt6g7bo8j56r7l.e2b.dev)
- **Produção Cloudflare**: ⏳ Pendente
- **Domínio Personalizado**: ⏳ Pendente

## 🛠️ Comandos de Desenvolvimento

```bash
# Iniciar desenvolvimento local
npm run dev:sandbox

# Build para produção
npm run build

# Deploy para Cloudflare Pages
npm run deploy:prod

# Gerenciar serviços PM2
pm2 list
pm2 logs webapp --nostream
pm2 restart webapp
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
```

## 🎯 Conclusão

Esta solução oferece a **funcionalidade de um aplicativo nativo** com a **simplicidade de um link web**. É executável em qualquer sistema operacional sem instalação, mantém integração direta com WhatsApp e oferece experiência moderna e intuitiva para os usuários.

**Perfect para distribuir via link, QR Code ou incorporar em sistemas internos.**