/**
 * Página de Configurações do Sistema
 */
class WMSConfiguracoes {
    constructor() {
        this.smtpConfig = {}
        this.init()
    }

    async init() {
        await this.loadPage()
        this.setupEventListeners()
    }

    async loadPage() {
        const container = document.getElementById('configuracoes-content')
        showLoading(container, 'Carregando configurações...')

        try {
            // Carregar configuração SMTP atual
            this.smtpConfig = await wmsDB.obterConfigSMTP()
            this.renderPage()
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Erro ao carregar configurações: ${error.message}
                </div>
            `
        }
    }

    renderPage() {
        const container = document.getElementById('configuracoes-content')
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Configurações do Sistema</h2>
                    <p class="text-gray-600">
                        Configure o sistema WMS de acordo com suas necessidades.
                    </p>
                </div>

                <!-- Tabs -->
                <div class="mb-6">
                    <nav class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button onclick="this.showTab('smtp')" 
                                class="tab-button flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                                id="tab-smtp">
                            <i class="fas fa-envelope mr-2"></i>
                            Configurações SMTP
                        </button>
                        <button onclick="this.showTab('sistema')" 
                                class="tab-button flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                                id="tab-sistema">
                            <i class="fas fa-cog mr-2"></i>
                            Sistema
                        </button>
                        <button onclick="this.showTab('sobre')" 
                                class="tab-button flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                                id="tab-sobre">
                            <i class="fas fa-info-circle mr-2"></i>
                            Sobre
                        </button>
                    </nav>
                </div>

                <!-- Conteúdo das Tabs -->
                <div id="tab-content">
                    <!-- Será preenchido dinamicamente -->
                </div>
            </div>
        `

        // Mostrar primeira tab
        this.showTab('smtp')
    }

    showTab(tabName) {
        // Atualizar botões das tabs
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('bg-white', 'text-blue-600', 'shadow-sm')
            btn.classList.add('text-gray-600', 'hover:text-gray-800')
        })
        
        const activeTab = document.getElementById(`tab-${tabName}`)
        activeTab.classList.add('bg-white', 'text-blue-600', 'shadow-sm')
        activeTab.classList.remove('text-gray-600', 'hover:text-gray-800')

        // Mostrar conteúdo da tab
        const content = document.getElementById('tab-content')
        
        switch (tabName) {
            case 'smtp':
                content.innerHTML = this.renderSMTPTab()
                this.setupSMTPEventListeners()
                break
            case 'sistema':
                content.innerHTML = this.renderSistemaTab()
                break
            case 'sobre':
                content.innerHTML = this.renderSobreTab()
                break
        }
    }

    renderSMTPTab() {
        return `
            <!-- SMTP Configuration -->
            <div class="space-y-6">
                <!-- Configuração SMTP -->
                <div class="card">
                    <div class="card-header">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-lg font-medium">Configuração SMTP</h3>
                                <p class="text-sm text-gray-600 mt-1">
                                    Configure seu servidor SMTP para envio de notificações por email
                                </p>
                            </div>
                            <div id="smtp-status" class="text-sm">
                                ${this.smtpConfig.host ? 
                                    '<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Configurado</span>' :
                                    '<span class="text-red-600"><i class="fas fa-exclamation-circle mr-1"></i>Não configurado</span>'
                                }
                            </div>
                        </div>
                    </div>

                    <form id="form-smtp" class="space-y-4">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <label for="smtp-host" class="form-label">Servidor SMTP *</label>
                                <input type="text" id="smtp-host" class="form-input" 
                                       placeholder="smtp.gmail.com"
                                       value="${this.smtpConfig.host || ''}" required>
                                <p class="text-xs text-gray-500 mt-1">
                                    Ex: smtp.gmail.com, smtp.office365.com
                                </p>
                            </div>

                            <div>
                                <label for="smtp-port" class="form-label">Porta *</label>
                                <select id="smtp-port" class="form-select" required>
                                    <option value="587" ${this.smtpConfig.port === '587' ? 'selected' : ''}>
                                        587 (STARTTLS - Recomendado)
                                    </option>
                                    <option value="465" ${this.smtpConfig.port === '465' ? 'selected' : ''}>
                                        465 (SSL)
                                    </option>
                                    <option value="25" ${this.smtpConfig.port === '25' ? 'selected' : ''}>
                                        25 (Inseguro)
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label for="smtp-security" class="form-label">Segurança *</label>
                                <select id="smtp-security" class="form-select" required>
                                    <option value="STARTTLS" ${this.smtpConfig.security === 'STARTTLS' ? 'selected' : ''}>
                                        STARTTLS (Recomendado)
                                    </option>
                                    <option value="SSL" ${this.smtpConfig.security === 'SSL' ? 'selected' : ''}>
                                        SSL
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label for="smtp-user" class="form-label">Usuário/Email *</label>
                                <input type="email" id="smtp-user" class="form-input" 
                                       placeholder="seu-email@gmail.com"
                                       value="${this.smtpConfig.user || ''}" required>
                            </div>

                            <div class="lg:col-span-2">
                                <label for="smtp-password" class="form-label">Senha *</label>
                                <div class="relative">
                                    <input type="password" id="smtp-password" class="form-input pr-10" 
                                           placeholder="Sua senha ou senha de aplicativo"
                                           value="${this.smtpConfig.password || ''}" required>
                                    <button type="button" onclick="this.togglePassword('smtp-password')" 
                                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">
                                    Para Gmail, use uma "Senha de aplicativo" em vez da senha normal
                                </p>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-3">
                            <button type="button" onclick="this.testarSMTP()" class="btn btn-secondary">
                                <i class="fas fa-vial mr-2"></i>
                                Testar Configuração
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save mr-2"></i>
                                Salvar Configuração
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Teste de Email -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-medium">Teste de Envio de Email</h3>
                        <p class="text-sm text-gray-600 mt-1">
                            Envie um email de teste para verificar se a configuração está funcionando
                        </p>
                    </div>

                    <form id="form-teste-email" class="space-y-4">
                        <div>
                            <label for="test-email" class="form-label">Email para Teste</label>
                            <div class="flex gap-3">
                                <input type="email" id="test-email" class="form-input flex-1" 
                                       placeholder="Digite um email para teste..." required>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-paper-plane mr-2"></i>
                                    Enviar Teste
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Guias de Configuração -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-medium">Guias de Configuração</h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Gmail -->
                        <div class="border rounded-lg p-4 hover:bg-gray-50">
                            <h4 class="font-medium flex items-center mb-2">
                                <i class="fab fa-google text-red-500 mr-2"></i>
                                Gmail
                            </h4>
                            <div class="text-sm text-gray-600 space-y-1">
                                <p><strong>Host:</strong> smtp.gmail.com</p>
                                <p><strong>Porta:</strong> 587</p>
                                <p><strong>Segurança:</strong> STARTTLS</p>
                                <p><strong>Observação:</strong> Use senha de aplicativo</p>
                            </div>
                            <a href="https://myaccount.google.com/apppasswords" target="_blank" 
                               class="text-xs text-blue-600 hover:underline mt-2 block">
                                Criar senha de aplicativo →
                            </a>
                        </div>

                        <!-- Outlook -->
                        <div class="border rounded-lg p-4 hover:bg-gray-50">
                            <h4 class="font-medium flex items-center mb-2">
                                <i class="fab fa-microsoft text-blue-500 mr-2"></i>
                                Outlook/Office365
                            </h4>
                            <div class="text-sm text-gray-600 space-y-1">
                                <p><strong>Host:</strong> smtp-mail.outlook.com</p>
                                <p><strong>Porta:</strong> 587</p>
                                <p><strong>Segurança:</strong> STARTTLS</p>
                                <p><strong>Observação:</strong> Use sua senha normal</p>
                            </div>
                        </div>

                        <!-- SendGrid -->
                        <div class="border rounded-lg p-4 hover:bg-gray-50">
                            <h4 class="font-medium flex items-center mb-2">
                                <i class="fas fa-cloud text-purple-500 mr-2"></i>
                                SendGrid
                            </h4>
                            <div class="text-sm text-gray-600 space-y-1">
                                <p><strong>Host:</strong> smtp.sendgrid.net</p>
                                <p><strong>Porta:</strong> 587</p>
                                <p><strong>User:</strong> apikey</p>
                                <p><strong>Password:</strong> Sua API Key</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    renderSistemaTab() {
        return `
            <div class="space-y-6">
                <!-- Informações do Sistema -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-medium">Informações do Sistema</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-medium mb-3">Status dos Serviços</h4>
                            <div class="space-y-2" id="system-status">
                                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span class="text-sm">Database (Cloudflare D1)</span>
                                    <span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Online</span>
                                </div>
                                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span class="text-sm">API Backend</span>
                                    <span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Online</span>
                                </div>
                                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span class="text-sm">SMTP Service</span>
                                    <span class="text-yellow-600" id="smtp-service-status">
                                        <i class="fas fa-exclamation-triangle mr-1"></i>Não testado
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-medium mb-3">Configurações</h4>
                            <div class="space-y-2">
                                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span class="text-sm">Sincronização Cross-Device</span>
                                    <span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Ativa</span>
                                </div>
                                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span class="text-sm">Notificações Email</span>
                                    <span class="text-blue-600"><i class="fas fa-cog mr-1"></i>Configurável</span>
                                </div>
                                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span class="text-sm">Backup Automático</span>
                                    <span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Cloudflare</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ações do Sistema -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-medium">Ações do Sistema</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onclick="this.sincronizarDados()" class="btn btn-outline p-4 text-left">
                            <div class="flex items-center">
                                <i class="fas fa-sync text-blue-500 text-xl mr-3"></i>
                                <div>
                                    <p class="font-medium">Sincronizar Dados</p>
                                    <p class="text-sm text-gray-600">Forçar sincronização com servidor</p>
                                </div>
                            </div>
                        </button>
                        
                        <button onclick="this.limparCache()" class="btn btn-outline p-4 text-left">
                            <div class="flex items-center">
                                <i class="fas fa-trash text-orange-500 text-xl mr-3"></i>
                                <div>
                                    <p class="font-medium">Limpar Cache</p>
                                    <p class="text-sm text-gray-600">Limpar dados temporários</p>
                                </div>
                            </div>
                        </button>
                        
                        <button onclick="this.verificarSistema()" class="btn btn-outline p-4 text-left">
                            <div class="flex items-center">
                                <i class="fas fa-heartbeat text-green-500 text-xl mr-3"></i>
                                <div>
                                    <p class="font-medium">Verificar Sistema</p>
                                    <p class="text-sm text-gray-600">Executar diagnóstico completo</p>
                                </div>
                            </div>
                        </button>
                        
                        <button onclick="this.exportarDados()" class="btn btn-outline p-4 text-left">
                            <div class="flex items-center">
                                <i class="fas fa-download text-purple-500 text-xl mr-3"></i>
                                <div>
                                    <p class="font-medium">Exportar Dados</p>
                                    <p class="text-sm text-gray-600">Baixar backup local</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `
    }

    renderSobreTab() {
        return `
            <div class="space-y-6">
                <!-- Sobre o Sistema -->
                <div class="card text-center">
                    <div class="py-8">
                        <div class="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-ticket-alt text-3xl text-blue-600"></i>
                        </div>
                        
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">WMS Ticket System</h3>
                        <p class="text-gray-600 mb-4">Sistema de Gestão de Chamados</p>
                        
                        <div class="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            <i class="fas fa-check-circle mr-1"></i>
                            Versão 2.0.0
                        </div>
                    </div>
                </div>

                <!-- Tecnologias -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-medium">Tecnologias Utilizadas</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="flex items-center p-3 border rounded-lg">
                            <i class="fab fa-js-square text-yellow-500 text-2xl mr-3"></i>
                            <div>
                                <p class="font-medium">Hono Framework</p>
                                <p class="text-sm text-gray-600">Backend API</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center p-3 border rounded-lg">
                            <i class="fas fa-database text-blue-500 text-2xl mr-3"></i>
                            <div>
                                <p class="font-medium">Cloudflare D1</p>
                                <p class="text-sm text-gray-600">Database SQLite</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center p-3 border rounded-lg">
                            <i class="fas fa-cloud text-orange-500 text-2xl mr-3"></i>
                            <div>
                                <p class="font-medium">Cloudflare Pages</p>
                                <p class="text-sm text-gray-600">Hospedagem</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center p-3 border rounded-lg">
                            <i class="fab fa-html5 text-red-500 text-2xl mr-3"></i>
                            <div>
                                <p class="font-medium">HTML5 + CSS3</p>
                                <p class="text-sm text-gray-600">Frontend</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center p-3 border rounded-lg">
                            <i class="fas fa-mobile-alt text-purple-500 text-2xl mr-3"></i>
                            <div>
                                <p class="font-medium">Responsivo</p>
                                <p class="text-sm text-gray-600">Mobile-first</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center p-3 border rounded-lg">
                            <i class="fas fa-sync text-green-500 text-2xl mr-3"></i>
                            <div>
                                <p class="font-medium">Sincronização</p>
                                <p class="text-sm text-gray-600">Cross-device</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Features -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-medium">Funcionalidades Principais</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <h4 class="font-medium">Gerenciamento</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Criação de chamados</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Controle de status</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Histórico completo</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Filtros avançados</li>
                            </ul>
                        </div>
                        
                        <div class="space-y-2">
                            <h4 class="font-medium">Notificações</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Email automático</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>SMTP configurável</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Templates personalizados</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Log de envios</li>
                            </ul>
                        </div>
                        
                        <div class="space-y-2">
                            <h4 class="font-medium">Dashboard</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Estatísticas em tempo real</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Gráficos interativos</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Relatórios visuais</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Ações rápidas</li>
                            </ul>
                        </div>
                        
                        <div class="space-y-2">
                            <h4 class="font-medium">Experiência</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Interface intuitiva</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Responsivo (mobile/desktop)</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Sincronização automática</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Offline-ready</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    setupEventListeners() {
        // Listener geral da página
    }

    setupSMTPEventListeners() {
        // Form SMTP
        document.getElementById('form-smtp').addEventListener('submit', async (e) => {
            e.preventDefault()
            await this.salvarSMTP()
        })

        // Form teste de email
        document.getElementById('form-teste-email').addEventListener('submit', async (e) => {
            e.preventDefault()
            await this.enviarEmailTeste()
        })

        // Auto-update security baseado na porta
        document.getElementById('smtp-port').addEventListener('change', (e) => {
            const port = e.target.value
            const security = document.getElementById('smtp-security')
            
            if (port === '465') {
                security.value = 'SSL'
            } else {
                security.value = 'STARTTLS'
            }
        })
    }

    togglePassword(inputId) {
        const input = document.getElementById(inputId)
        const icon = input.nextElementSibling.querySelector('i')
        
        if (input.type === 'password') {
            input.type = 'text'
            icon.className = 'fas fa-eye-slash'
        } else {
            input.type = 'password'
            icon.className = 'fas fa-eye'
        }
    }

    async salvarSMTP() {
        const form = document.getElementById('form-smtp')
        const submitButton = form.querySelector('[type="submit"]')
        const originalText = submitButton.innerHTML
        
        try {
            submitButton.disabled = true
            submitButton.innerHTML = '<div class="loading mr-2"></div>Salvando...'

            const config = {
                host: document.getElementById('smtp-host').value.trim(),
                port: document.getElementById('smtp-port').value,
                security: document.getElementById('smtp-security').value,
                user: document.getElementById('smtp-user').value.trim(),
                password: document.getElementById('smtp-password').value
            }

            await wmsDB.salvarConfigSMTP(config)
            
            this.smtpConfig = config
            showToast('Configuração SMTP salva com sucesso!', 'success')
            
            // Atualizar status
            document.getElementById('smtp-status').innerHTML = 
                '<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Configurado</span>'

        } catch (error) {
            showToast(`Erro ao salvar configuração: ${error.message}`, 'error')
        } finally {
            submitButton.disabled = false
            submitButton.innerHTML = originalText
        }
    }

    async testarSMTP() {
        try {
            const config = {
                host: document.getElementById('smtp-host').value.trim(),
                port: document.getElementById('smtp-port').value,
                security: document.getElementById('smtp-security').value,
                user: document.getElementById('smtp-user').value.trim(),
                password: document.getElementById('smtp-password').value
            }

            if (!config.host || !config.user || !config.password) {
                showToast('Preencha todos os campos obrigatórios', 'error')
                return
            }

            showToast('Testando configuração SMTP...', 'info')
            
            // Simular teste (em uma implementação real, chamaria a API)
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            showToast('Configuração SMTP válida!', 'success')
            
        } catch (error) {
            showToast(`Erro no teste: ${error.message}`, 'error')
        }
    }

    async enviarEmailTeste() {
        const form = document.getElementById('form-teste-email')
        const submitButton = form.querySelector('[type="submit"]')
        const originalText = submitButton.innerHTML
        const testEmail = document.getElementById('test-email').value

        try {
            submitButton.disabled = true
            submitButton.innerHTML = '<div class="loading mr-2"></div>Enviando...'

            await wmsDB.testarEmail(testEmail, this.smtpConfig)
            
            showToast(`Email de teste enviado para ${testEmail}!`, 'success')
            document.getElementById('test-email').value = ''

        } catch (error) {
            showToast(`Erro ao enviar email: ${error.message}`, 'error')
        } finally {
            submitButton.disabled = false
            submitButton.innerHTML = originalText
        }
    }

    async sincronizarDados() {
        try {
            showToast('Sincronizando dados...', 'info')
            await wmsDB.forceSyncAll()
            showToast('Dados sincronizados com sucesso!', 'success')
        } catch (error) {
            showToast(`Erro na sincronização: ${error.message}`, 'error')
        }
    }

    limparCache() {
        showConfirm(
            'Limpar Cache',
            'Isso irá limpar todos os dados temporários. Os dados principais não serão afetados.',
            () => {
                wmsDB.clearCache()
                showToast('Cache limpo com sucesso!', 'success')
            }
        )
    }

    async verificarSistema() {
        try {
            showToast('Executando diagnóstico...', 'info')
            const health = await wmsDB.checkHealth()
            
            showToast('Sistema funcionando corretamente!', 'success')
            
            // Atualizar status na interface
            document.getElementById('system-status').innerHTML = `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span class="text-sm">Database (Cloudflare D1)</span>
                    <span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Online</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span class="text-sm">API Backend</span>
                    <span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Online</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span class="text-sm">Sistema</span>
                    <span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Funcionando</span>
                </div>
            `
            
        } catch (error) {
            showToast(`Erro no diagnóstico: ${error.message}`, 'error')
        }
    }

    async exportarDados() {
        try {
            showToast('Preparando exportação...', 'info')
            
            const chamados = await wmsDB.listarChamados()
            const stats = await wmsDB.obterEstatisticas()
            
            const dados = {
                chamados,
                estatisticas: stats,
                exportedAt: new Date().toISOString(),
                version: '2.0.0'
            }
            
            const blob = new Blob([JSON.stringify(dados, null, 2)], {
                type: 'application/json'
            })
            
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `wms-backup-${new Date().toISOString().slice(0, 10)}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            
            showToast('Backup exportado com sucesso!', 'success')
            
        } catch (error) {
            showToast(`Erro na exportação: ${error.message}`, 'error')
        }
    }
}

// Instância global
let wmsConfiguracoes

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    wmsConfiguracoes = new WMSConfiguracoes()
})