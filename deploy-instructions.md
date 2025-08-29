# 🚀 Instruções de Deploy - Sistema WMS SMTP v1

## 📋 Versão Atual
- **Commit**: d2083fd 
- **Versão**: 20250829_smtp_v1_d2083fd
- **Funcionalidades**: Sistema SMTP completo implementado

## 🔧 Deploy Manual (Recomendado)

### 1. **GitHub**
✅ **Código já está no GitHub**: https://github.com/tgszdev/chamasdos-wiser

### 2. **Cloudflare Pages**

#### Opção A: Via Dashboard Cloudflare
1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Pages** → **Create a project**
3. Conecte ao repositório: `tgszdev/chamasdos-wiser`
4. **Build settings**:
   ```
   Framework preset: None
   Build command: npm run build
   Build output directory: /dist
   Root directory: /
   ```
5. **Environment variables** (opcional):
   ```
   NODE_ENV=production
   ```
6. Deploy!

#### Opção B: Via Wrangler (se tiver API key)
```bash
# 1. Configure API key no Deploy tab primeiro
# 2. Depois execute:
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name webapp
```

## 📦 Build Local (para verificar)
```bash
cd /home/user/webapp
npm install
npm run build
# Verifica se dist/ foi criado corretamente
ls -la dist/
```

## 🔍 Verificar Versão Atual
Após deploy, acesse:
- Página principal e pressione `Ctrl+U` (view source)
- Procure por: `VERSÃO DEPLOY: 20250829_smtp_v1_d2083fd`

## 📱 URLs de Teste Pós-Deploy
- **Principal**: https://seu-projeto.pages.dev/
- **Admin SMTP**: https://seu-projeto.pages.dev/admin.html
- **Gerenciar**: https://seu-projeto.pages.dev/chamados.html

## 🎯 Funcionalidades para Testar
1. ✅ Criar chamado novo
2. ✅ Configurar SMTP no admin
3. ✅ Testar conexão SMTP  
4. ✅ Enviar e-mail de teste
5. ✅ Verificar alertas automáticos (logs no console)

## 🆘 Troubleshooting

### Se o deploy falhar:
1. **Verificar build local**: `npm run build` deve funcionar
2. **Verificar node_modules**: Delete e `npm install` novamente
3. **Verificar package.json**: Confirme dependências corretas

### Se versão antiga aparecer:
1. **Cache do browser**: Ctrl+F5 ou modo incógnito
2. **Cache do Cloudflare**: Purge cache no dashboard
3. **Verificar commit**: Confirme que commit d2083fd está no GitHub

## 📞 Suporte
Se precisar de ajuda, forneça:
- URL do seu projeto
- Mensagem de erro (se houver)
- Print da versão que aparece no view source