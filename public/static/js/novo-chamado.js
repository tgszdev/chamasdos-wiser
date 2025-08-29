/**
 * Página de Criação de Novo Chamado
 */
class WMSNovoChamado {
    constructor() {
        this.form = null
        this.init()
    }

    init() {
        this.renderForm()
        this.setupEventListeners()
        this.setupFormValidation()
    }

    renderForm() {
        const container = document.getElementById('novo-chamado-content')
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Criar Novo Chamado</h2>
                    <p class="text-gray-600">
                        Preencha as informações abaixo para abrir um novo chamado no sistema WMS.
                    </p>
                </div>

                <!-- Formulário -->
                <form id="form-novo-chamado" class="space-y-6">
                    <!-- Informações do Chamado -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-medium">
                                <i class="fas fa-ticket-alt mr-2 text-blue-500"></i>
                                Informações do Chamado
                            </h3>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div class="lg:col-span-2">
                                <label for="titulo" class="form-label">
                                    Título do Chamado *
                                </label>
                                <input type="text" id="titulo" name="titulo" class="form-input" 
                                       placeholder="Descreva brevemente o problema ou solicitação..."
                                       maxlength="200" required>
                                <p class="text-sm text-gray-500 mt-1">
                                    Seja claro e específico. Ex: "Sistema lento na tela de vendas"
                                </p>
                            </div>
                            
                            <div>
                                <label for="prioridade" class="form-label">
                                    Prioridade *
                                </label>
                                <select id="prioridade" name="prioridade" class="form-select" required>
                                    <option value="">Selecione a prioridade</option>
                                    <option value="baixa">
                                        🔵 Baixa - Não impacta o trabalho
                                    </option>
                                    <option value="media" selected>
                                        🟡 Média - Impacto moderado
                                    </option>
                                    <option value="alta">
                                        🟠 Alta - Impacta significativamente
                                    </option>
                                    <option value="urgente">
                                        🔴 Urgente - Sistema parado/crítico
                                    </option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="form-label">Status</label>
                                <div class="form-input bg-gray-50 flex items-center">
                                    <span class="status-badge status-aberta">
                                        <i class="fas fa-exclamation-circle mr-1"></i>
                                        Aberta
                                    </span>
                                    <span class="ml-2 text-sm text-gray-500">
                                        (Definido automaticamente)
                                    </span>
                                </div>
                            </div>
                            
                            <div class="lg:col-span-2">
                                <label for="descricao" class="form-label">
                                    Descrição Detalhada
                                </label>
                                <textarea id="descricao" name="descricao" rows="4" class="form-textarea"
                                          placeholder="Descreva detalhadamente o problema, quando começou, o que você estava fazendo, mensagens de erro, etc..."></textarea>
                                <p class="text-sm text-gray-500 mt-1">
                                    Quanto mais detalhes, mais rápida será a solução. Inclua mensagens de erro, passos para reproduzir o problema, etc.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Informações do Solicitante -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-medium">
                                <i class="fas fa-user mr-2 text-green-500"></i>
                                Informações do Solicitante
                            </h3>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label for="solicitante_nome" class="form-label">
                                    Nome Completo *
                                </label>
                                <input type="text" id="solicitante_nome" name="solicitante_nome" class="form-input"
                                       placeholder="Digite seu nome completo..."
                                       maxlength="100" required>
                            </div>
                            
                            <div>
                                <label for="solicitante_email" class="form-label">
                                    Email *
                                </label>
                                <input type="email" id="solicitante_email" name="solicitante_email" class="form-input"
                                       placeholder="seu.email@empresa.com"
                                       maxlength="100" required>
                                <p class="text-sm text-gray-500 mt-1">
                                    Será usado para notificações sobre o chamado
                                </p>
                            </div>
                            
                            <div>
                                <label for="solicitante_telefone" class="form-label">
                                    Telefone
                                </label>
                                <input type="tel" id="solicitante_telefone" name="solicitante_telefone" class="form-input"
                                       placeholder="(11) 99999-9999"
                                       maxlength="20">
                                <p class="text-sm text-gray-500 mt-1">
                                    Opcional - para contato urgente
                                </p>
                            </div>
                            
                            <div>
                                <label for="solicitante_setor" class="form-label">
                                    Setor/Departamento
                                </label>
                                <select id="solicitante_setor" name="solicitante_setor" class="form-select">
                                    <option value="">Selecione seu setor</option>
                                    <option value="Vendas">Vendas</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Financeiro">Financeiro</option>
                                    <option value="RH">Recursos Humanos</option>
                                    <option value="TI">Tecnologia da Informação</option>
                                    <option value="Operações">Operações</option>
                                    <option value="Atendimento">Atendimento ao Cliente</option>
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Diretoria">Diretoria</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                        <button type="button" onclick="this.limparFormulario()" class="btn btn-secondary">
                            <i class="fas fa-eraser mr-2"></i>
                            Limpar Formulário
                        </button>
                        
                        <button type="button" onclick="this.salvarRascunho()" class="btn btn-outline">
                            <i class="fas fa-save mr-2"></i>
                            Salvar Rascunho
                        </button>
                        
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane mr-2"></i>
                            Criar Chamado
                        </button>
                    </div>
                </form>

                <!-- Dicas -->
                <div class="mt-8">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 class="font-medium text-blue-800 mb-3">
                            <i class="fas fa-lightbulb mr-2"></i>
                            Dicas para um chamado eficiente
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                            <div>
                                <h5 class="font-medium mb-2">📝 Título claro</h5>
                                <p>Use títulos específicos como "Erro ao salvar cliente" em vez de "Sistema com problema"</p>
                            </div>
                            <div>
                                <h5 class="font-medium mb-2">🔍 Detalhes importantes</h5>
                                <p>Inclua quando o problema começou, o que você estava fazendo e mensagens de erro</p>
                            </div>
                            <div>
                                <h5 class="font-medium mb-2">⚡ Prioridade correta</h5>
                                <p>Use "Urgente" apenas para problemas que impedem completamente o trabalho</p>
                            </div>
                            <div>
                                <h5 class="font-medium mb-2">📧 Email atualizado</h5>
                                <p>Verifique se o email está correto para receber notificações</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `

        this.form = document.getElementById('form-novo-chamado')
        this.carregarRascunho()
    }

    setupEventListeners() {
        // Submit do formulário
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault()
            await this.criarChamado()
        })

        // Auto-salvar rascunho
        const autoSave = WMSUtils.debounce(() => {
            this.salvarRascunhoAuto()
        }, 2000)

        // Adicionar auto-save nos campos principais
        const campos = ['titulo', 'descricao', 'solicitante_nome', 'solicitante_email']
        campos.forEach(campo => {
            document.getElementById(campo).addEventListener('input', autoSave)
        })

        // Formatação automática do telefone
        document.getElementById('solicitante_telefone').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '')
            
            if (value.length >= 11) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
            } else if (value.length >= 7) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
            } else if (value.length >= 3) {
                value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
            }
            
            e.target.value = value
        })

        // Validação em tempo real do email
        document.getElementById('solicitante_email').addEventListener('blur', (e) => {
            const email = e.target.value
            if (email && !WMSUtils.isValidEmail(email)) {
                e.target.classList.add('border-red-500')
                this.showFieldError(e.target, 'Email inválido')
            } else {
                e.target.classList.remove('border-red-500')
                this.hideFieldError(e.target)
            }
        })
    }

    setupFormValidation() {
        // Validação personalizada
        const requiredFields = [
            { id: 'titulo', message: 'Título é obrigatório' },
            { id: 'prioridade', message: 'Selecione uma prioridade' },
            { id: 'solicitante_nome', message: 'Nome é obrigatório' },
            { id: 'solicitante_email', message: 'Email é obrigatório' }
        ]

        requiredFields.forEach(field => {
            const element = document.getElementById(field.id)
            
            element.addEventListener('blur', () => {
                this.validateField(element, field.message)
            })
            
            element.addEventListener('input', () => {
                if (element.classList.contains('border-red-500')) {
                    this.validateField(element, field.message)
                }
            })
        })
    }

    validateField(element, message) {
        const isValid = element.value.trim() !== ''
        
        if (!isValid) {
            element.classList.add('border-red-500')
            this.showFieldError(element, message)
            return false
        } else {
            element.classList.remove('border-red-500')
            this.hideFieldError(element)
            return true
        }
    }

    showFieldError(element, message) {
        // Remove erro anterior
        this.hideFieldError(element)
        
        const errorDiv = document.createElement('div')
        errorDiv.className = 'field-error text-sm text-red-600 mt-1'
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`
        
        element.parentNode.appendChild(errorDiv)
    }

    hideFieldError(element) {
        const error = element.parentNode.querySelector('.field-error')
        if (error) {
            error.remove()
        }
    }

    validateForm() {
        const titulo = document.getElementById('titulo').value.trim()
        const prioridade = document.getElementById('prioridade').value
        const nome = document.getElementById('solicitante_nome').value.trim()
        const email = document.getElementById('solicitante_email').value.trim()

        let isValid = true

        if (!titulo) {
            this.validateField(document.getElementById('titulo'), 'Título é obrigatório')
            isValid = false
        }

        if (!prioridade) {
            this.validateField(document.getElementById('prioridade'), 'Selecione uma prioridade')
            isValid = false
        }

        if (!nome) {
            this.validateField(document.getElementById('solicitante_nome'), 'Nome é obrigatório')
            isValid = false
        }

        if (!email) {
            this.validateField(document.getElementById('solicitante_email'), 'Email é obrigatório')
            isValid = false
        } else if (!WMSUtils.isValidEmail(email)) {
            this.showFieldError(document.getElementById('solicitante_email'), 'Email inválido')
            isValid = false
        }

        return isValid
    }

    async criarChamado() {
        if (!this.validateForm()) {
            showToast('Por favor, corrija os erros no formulário', 'error')
            return
        }

        const submitButton = this.form.querySelector('[type="submit"]')
        const originalText = submitButton.innerHTML
        
        try {
            // Mostrar loading
            submitButton.disabled = true
            submitButton.innerHTML = '<div class="loading mr-2"></div>Criando...'

            // Coletar dados do formulário
            const dados = {
                titulo: document.getElementById('titulo').value.trim(),
                descricao: document.getElementById('descricao').value.trim(),
                prioridade: document.getElementById('prioridade').value,
                solicitante_nome: document.getElementById('solicitante_nome').value.trim(),
                solicitante_email: document.getElementById('solicitante_email').value.trim(),
                solicitante_telefone: document.getElementById('solicitante_telefone').value.trim(),
                solicitante_setor: document.getElementById('solicitante_setor').value
            }

            // Criar chamado
            const chamado = await wmsDB.criarChamado(dados)

            // Sucesso
            showToast('Chamado criado com sucesso!', 'success')
            
            // Limpar rascunho
            localStorage.removeItem('wms_rascunho_chamado')
            
            // Mostrar modal de sucesso
            this.showSucessoModal(chamado)

        } catch (error) {
            showToast(`Erro ao criar chamado: ${error.message}`, 'error')
        } finally {
            submitButton.disabled = false
            submitButton.innerHTML = originalText
        }
    }

    showSucessoModal(chamado) {
        const modal = document.createElement('div')
        modal.className = 'modal-overlay'
        modal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="mb-6">
                        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Chamado Criado com Sucesso!</h3>
                        <p class="text-gray-600">
                            Seu chamado foi registrado e receberá atendimento em breve.
                        </p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4 mb-6">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium text-gray-600">ID do Chamado:</span>
                            <span class="font-mono font-bold text-blue-600">${chamado.id}</span>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-sm font-medium text-gray-600">Status:</span>
                            <span class="status-badge status-aberta">Aberta</span>
                        </div>
                    </div>
                    
                    <div class="text-sm text-gray-600 mb-6">
                        <p><i class="fas fa-envelope mr-2 text-blue-500"></i>
                            Notificações serão enviadas para: <strong>${chamado.solicitante_email}</strong>
                        </p>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onclick="this.closest('.modal-overlay').remove(); wmsNovoChamado.limparFormulario()" 
                                class="btn btn-secondary">
                            <i class="fas fa-plus mr-2"></i>
                            Criar Outro Chamado
                        </button>
                        
                        <button onclick="window.location.href='/chamados?id=${chamado.id}'" 
                                class="btn btn-primary">
                            <i class="fas fa-eye mr-2"></i>
                            Ver Chamado
                        </button>
                        
                        <button onclick="window.location.href='/dashboard'" 
                                class="btn btn-outline">
                            <i class="fas fa-home mr-2"></i>
                            Ir ao Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `

        document.body.appendChild(modal)
    }

    limparFormulario() {
        showConfirm(
            'Limpar Formulário',
            'Tem certeza que deseja limpar todos os campos? Os dados não salvos serão perdidos.',
            () => {
                this.form.reset()
                // Limpar rascunho
                localStorage.removeItem('wms_rascunho_chamado')
                // Remover classes de erro
                this.form.querySelectorAll('.border-red-500').forEach(el => {
                    el.classList.remove('border-red-500')
                })
                this.form.querySelectorAll('.field-error').forEach(el => {
                    el.remove()
                })
                showToast('Formulário limpo', 'info')
            }
        )
    }

    salvarRascunho() {
        const dados = this.coletarDadosFormulario()
        localStorage.setItem('wms_rascunho_chamado', JSON.stringify({
            ...dados,
            timestamp: Date.now()
        }))
        showToast('Rascunho salvo', 'success', 2000)
    }

    salvarRascunhoAuto() {
        const dados = this.coletarDadosFormulario()
        
        // Só salvar se há dados significativos
        if (dados.titulo || dados.descricao || dados.solicitante_nome) {
            localStorage.setItem('wms_rascunho_chamado', JSON.stringify({
                ...dados,
                timestamp: Date.now()
            }))
        }
    }

    carregarRascunho() {
        try {
            const rascunho = localStorage.getItem('wms_rascunho_chamado')
            if (rascunho) {
                const dados = JSON.parse(rascunho)
                
                // Verificar se o rascunho não é muito antigo (24 horas)
                const isOld = Date.now() - dados.timestamp > 24 * 60 * 60 * 1000
                
                if (isOld) {
                    localStorage.removeItem('wms_rascunho_chamado')
                    return
                }

                // Mostrar opção de carregar rascunho
                this.showRascunhoModal(dados)
            }
        } catch (error) {
            console.error('Erro ao carregar rascunho:', error)
            localStorage.removeItem('wms_rascunho_chamado')
        }
    }

    showRascunhoModal(dados) {
        const modal = document.createElement('div')
        modal.className = 'modal-overlay'
        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="text-lg font-medium mb-4">
                    <i class="fas fa-save mr-2 text-blue-500"></i>
                    Rascunho Encontrado
                </h3>
                <p class="text-gray-600 mb-4">
                    Encontramos um rascunho salvo em ${WMSUtils.formatDate(dados.timestamp)}.
                    Deseja restaurar os dados?
                </p>
                
                <div class="bg-gray-50 rounded p-3 mb-6 text-sm">
                    <p><strong>Título:</strong> ${dados.titulo || 'Não preenchido'}</p>
                    <p><strong>Solicitante:</strong> ${dados.solicitante_nome || 'Não preenchido'}</p>
                </div>
                
                <div class="flex justify-end space-x-3">
                    <button onclick="this.closest('.modal-overlay').remove(); localStorage.removeItem('wms_rascunho_chamado')" 
                            class="btn btn-secondary">
                        Descartar
                    </button>
                    <button onclick="this.closest('.modal-overlay').remove(); wmsNovoChamado.preencherFormulario(${JSON.stringify(dados).replace(/"/g, '&quot;')})" 
                            class="btn btn-primary">
                        Restaurar
                    </button>
                </div>
            </div>
        `

        document.body.appendChild(modal)
    }

    preencherFormulario(dados) {
        document.getElementById('titulo').value = dados.titulo || ''
        document.getElementById('descricao').value = dados.descricao || ''
        document.getElementById('prioridade').value = dados.prioridade || 'media'
        document.getElementById('solicitante_nome').value = dados.solicitante_nome || ''
        document.getElementById('solicitante_email').value = dados.solicitante_email || ''
        document.getElementById('solicitante_telefone').value = dados.solicitante_telefone || ''
        document.getElementById('solicitante_setor').value = dados.solicitante_setor || ''
        
        showToast('Rascunho restaurado', 'success')
    }

    coletarDadosFormulario() {
        return {
            titulo: document.getElementById('titulo').value.trim(),
            descricao: document.getElementById('descricao').value.trim(),
            prioridade: document.getElementById('prioridade').value,
            solicitante_nome: document.getElementById('solicitante_nome').value.trim(),
            solicitante_email: document.getElementById('solicitante_email').value.trim(),
            solicitante_telefone: document.getElementById('solicitante_telefone').value.trim(),
            solicitante_setor: document.getElementById('solicitante_setor').value
        }
    }
}

// Instância global
let wmsNovoChamado

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    wmsNovoChamado = new WMSNovoChamado()
})