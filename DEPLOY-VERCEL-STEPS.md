# 🚀 Deploy no Vercel - Instruções Passo-a-Passo

## 📋 **Status Atual**

✅ **GitHub**: Código sincronizado - `v20250829_050500`
✅ **Push**: Feito com sucesso - 5 commits enviados
✅ **Função**: `clearAllChamados()` implementada e testada
❌ **Vercel**: Não configurado ainda (404 em todas as URLs testadas)

## 🎯 **Passo-a-Passo Para Deploy**

### **MÉTODO 1: Via Interface Web (RECOMENDADO)**

1. **Acesse**: https://vercel.com
2. **Login/Signup**: Com sua conta GitHub
3. **Clique**: "New Project" 
4. **Selecione**: Repositório `tgszdev/chamasdos-wiser`
5. **Configure**:
   - **Project Name**: `chamados-wms` (ou nome desejado)
   - **Framework Preset**: "Other"
   - **Root Directory**: `./` (raiz)
   - **Build Command**: Deixar vazio
   - **Output Directory**: Deixar vazio (site estático)
6. **Deploy**: Clique "Deploy"

### **MÉTODO 2: Via Vercel CLI**

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm install -g vercel

# 2. Fazer login
vercel login

# 3. No diretório do projeto
cd /home/user/webapp
vercel

# 4. Responder perguntas:
# ? Set up and deploy "~/webapp"? Y
# ? Which scope do you want to deploy to? [Seu usuário]
# ? Link to existing project? N
# ? What's your project's name? chamados-wms
# ? In which directory is your code located? ./

# 5. Deploy para produção
vercel --prod
```

---

## 📁 **Arquivos Importantes Já Configurados**

### ✅ **vercel.json** (Configuração completa):
```json
{
  "version": 2,
  "name": "wms-chamados", 
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/chamados",
      "destination": "/chamados.html"
    },
    {
      "source": "/login", 
      "destination": "/login.html"
    },
    {
      "source": "/admin",
      "destination": "/admin.html"
    }
  ]
}
```

### ✅ **package.json** (Build otimizado):
- Configurado para sites estáticos
- Sem dependências de build
- Scripts otimizados

---

## 🎯 **URLs Esperadas Após Deploy**

### **Automática do Vercel**:
- `https://chamados-wms.vercel.app` 
- `https://chamados-wms-git-master-[usuario].vercel.app`
- `https://chamados-wms-[hash].vercel.app`

### **Rotas Funcionais**:
- `/` - Página principal (index.html)
- `/chamados` - Lista de chamados 
- `/login` - Sistema de login
- `/admin` - Painel administrativo

---

## ✅ **Verificações Pós-Deploy**

### **1. Testar Versão**:
```bash
curl https://[sua-url].vercel.app/chamados | grep "v20250829_050500"
```

### **2. Testar Função Apagar Todos**:
```bash  
curl https://[sua-url].vercel.app/chamados | grep -c "clearAllChamados"
# Deve retornar: 2
```

### **3. Testar Rotas**:
- ✅ `https://[url]/chamados` - Deve carregar página de chamados
- ✅ `https://[url]/login` - Deve carregar página de login  
- ✅ `https://[url]/admin` - Deve carregar painel admin

---

## 🔧 **Configurações Adicionais (Opcional)**

### **Environment Variables** (se precisar):
```
NODE_ENV=production
```

### **Domínio Personalizado**:
1. No painel Vercel: Settings → Domains
2. Adicionar: `chamados.seudominio.com.br`
3. Configurar DNS conforme instruções

---

## 📱 **Resultado Final Esperado**

Após o deploy, você terá:

✅ **Aplicação completa** com função "Apagar Todos"
✅ **URLs limpas** (/chamados, /login, /admin) 
✅ **HTTPS automático** e CDN global
✅ **Versão v050500** com cache busting
✅ **Deploy automático** a cada push no GitHub

---

## 🆘 **Se Der Erro**

### **Build Failed**:
- Verificar se `vercel.json` está na raiz
- Confirmar que arquivos HTML existem

### **404 nas Rotas**:
- Verificar configuração `rewrites` no vercel.json
- Confirmar nomes dos arquivos (.html)

### **Função Não Funciona**:
- Problema de JavaScript (verificar console do navegador)
- Cache do navegador (force refresh)

---

## 🎯 **Próximo Passo**

**Faça o deploy agora usando MÉTODO 1 (interface web) ou MÉTODO 2 (CLI)**

Depois do deploy, me informe a URL para verificarmos se a versão `v20250829_050500` e a função "Apagar Todos" estão funcionando corretamente no Vercel!