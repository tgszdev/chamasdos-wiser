/**
 * Página de Gerenciamento de Chamados
 */
class WMSChamados {
    constructor() {
        this.chamados = []
        this.filtros = {}
        this.currentPage = 1
        this.pageSize = 10
        
        this.init()
    }

    async init() {
        await this.loadChamados()
        this.setupEventListeners()
        this.setupFilters()
    }

    async loadChamados() {
        const container = document.getElementById('chamados-content')
        showLoading(container, 'Carregando chamados...')

        try {
            this.chamados = await wmsDB.listarChamados()
            this.renderPage()
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Erro ao carregar chamados: ${error.message}
                    <button onclick="location.reload()" class="btn btn-sm btn-outline ml-4">
                        Tentar Novamente
                    </button>
                </div>
            `
        }
    }

    renderPage() {
        const container = document.getElementById('chamados-content')
        
        // Aplicar filtros
        const chamadosFiltrados = this.aplicarFiltros()
        
        // Paginação
        const startIndex = (this.currentPage - 1) * this.pageSize
        const endIndex = startIndex + this.pageSize
        const chamadosPagina = chamadosFiltrados.slice(startIndex, endIndex)
        const totalPages = Math.ceil(chamadosFiltrados.length / this.pageSize)

        container.innerHTML = `
            <!-- Header com Filtros -->
            <div class="mb-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                        Gerenciar Chamados
                        <span class="text-base font-normal text-gray-500">
                            (${chamadosFiltrados.length} ${chamadosFiltrados.length === 1 ? 'chamado' : 'chamados'})
                        </span>
                    </h2>
                    
                    <div class="flex space-x-2">
                        <a href="/novo-chamado" class="btn btn-primary">
                            <i class="fas fa-plus mr-2"></i>
                            Novo Chamado
                        </a>
                        <button onclick="wmsDB.syncChamados().then(() => this.loadChamados())" class="btn btn-secondary">
                            <i class="fas fa-sync mr-2"></i>
                            Sincronizar
                        </button>
                    </div>
                </div>
                
                <!-- Filtros -->
                <div class="bg-white p-4 rounded-lg shadow-sm border">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label class="form-label">Buscar</label>
                            <input type="text" id="filtro-busca" class="form-input" 
                                   placeholder="Título, ID ou solicitante...">
                        </div>
                        
                        <div>
                            <label class="form-label">Status</label>
                            <select id="filtro-status" class="form-select">
                                <option value="">Todos</option>
                                <option value="aberta">Aberta</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="finalizada">Finalizada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="form-label">Prioridade</label>
                            <select id="filtro-prioridade" class="form-select">
                                <option value="">Todas</option>
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>
                        
                        <div class="flex items-end">
                            <button onclick="this.limparFiltros()" class="btn btn-outline w-full">
                                <i class="fas fa-times mr-2"></i>
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabela de Chamados -->
            <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
                ${chamadosPagina.length > 0 ? `
                    <div class="overflow-x-auto">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Status</th>
                                    <th>Prioridade</th>
                                    <th>Solicitante</th>
                                    <th>Data Abertura</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${chamadosPagina.map(chamado => this.renderChamadoRow(chamado)).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Paginação -->
                    ${totalPages > 1 ? this.renderPagination(totalPages) : ''}
                ` : `
                    <div class="text-center py-12">
                        <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                        <p class="text-lg font-medium text-gray-600 mb-2">Nenhum chamado encontrado</p>
                        <p class="text-gray-500 mb-6">
                            ${Object.keys(this.filtros).length > 0 ? 
                                'Tente ajustar os filtros ou criar um novo chamado.' : 
                                'Comece criando seu primeiro chamado.'
                            }
                        </p>
                        <div class="space-x-3">
                            ${Object.keys(this.filtros).length > 0 ? `
                                <button onclick="this.limparFiltros()" class="btn btn-secondary">
                                    Limpar Filtros
                                </button>
                            ` : ''}
                            <a href="/novo-chamado" class="btn btn-primary">
                                <i class="fas fa-plus mr-2"></i>
                                Criar Chamado
                            </a>
                        </div>
                    </div>
                `}
            </div>

            <!-- Modal de Detalhes (será inserido dinamicamente) -->
            <div id="modal-detalhes"></div>
        `

        // Configurar valores dos filtros
        this.restaurarFiltros()
    }

    renderChamadoRow(chamado) {
        const statusInfo = WMSUtils.getStatusInfo(chamado.status)
        const priorityInfo = WMSUtils.getPriorityInfo(chamado.prioridade)

        return `
            <tr class="hover:bg-gray-50 cursor-pointer" onclick="this.verDetalhes('${chamado.id}')">
                <td class="font-mono text-sm">${chamado.id}</td>
                <td>
                    <div class="max-w-xs">
                        <p class="font-medium truncate">${chamado.titulo}</p>
                        ${chamado.descricao ? `
                            <p class="text-sm text-gray-500 truncate">${WMSUtils.truncate(chamado.descricao, 50)}</p>
                        ` : ''}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusInfo.class}">
                        <i class="${statusInfo.icon} mr-1"></i>
                        ${statusInfo.label}
                    </span>
                </td>
                <td>
                    <span class="priority-badge ${priorityInfo.class}">
                        <i class="${priorityInfo.icon} mr-1"></i>
                        ${priorityInfo.label}
                    </span>
                </td>
                <td>
                    <div>
                        <p class="font-medium">${chamado.solicitante_nome}</p>
                        <p class="text-sm text-gray-500">${chamado.solicitante_email}</p>
                        ${chamado.solicitante_setor ? `
                            <p class="text-xs text-gray-400">${chamado.solicitante_setor}</p>
                        ` : ''}
                    </div>
                </td>
                <td class="text-sm text-gray-600">
                    <div>
                        <p>${WMSUtils.formatDate(chamado.data_abertura, false)}</p>
                        <p class="text-xs text-gray-400">${WMSUtils.formatRelativeDate(chamado.data_abertura)}</p>
                    </div>
                </td>
                <td>
                    <div class="flex space-x-1" onclick="event.stopPropagation()">
                        <button onclick="this.verDetalhes('${chamado.id}')" 
                                class="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${chamado.status !== 'finalizada' && chamado.status !== 'cancelada' ? `
                            <button onclick="this.editarStatus('${chamado.id}', '${chamado.status}')" 
                                    class="p-2 text-green-600 hover:bg-green-100 rounded"
                                    title="Alterar status">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `
    }

    renderPagination(totalPages) {
        const pages = []
        const maxVisible = 5
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
        let endPage = Math.min(totalPages, startPage + maxVisible - 1)
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1)
        }

        return `
            <div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                <div class="flex items-center text-sm text-gray-700">
                    Página ${this.currentPage} de ${totalPages}
                </div>
                
                <div class="flex space-x-1">
                    ${this.currentPage > 1 ? `
                        <button onclick="this.changePage(${this.currentPage - 1})" 
                                class="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50">
                            Anterior
                        </button>
                    ` : ''}
                    
                    ${Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i).map(page => `
                        <button onclick="this.changePage(${page})" 
                                class="px-3 py-2 text-sm border rounded ${page === this.currentPage ? 
                                    'bg-blue-500 text-white border-blue-500' : 
                                    'bg-white hover:bg-gray-50'}">
                            ${page}
                        </button>
                    `).join('')}
                    
                    ${this.currentPage < totalPages ? `
                        <button onclick="this.changePage(${this.currentPage + 1})" 
                                class="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50">
                            Próxima
                        </button>
                    ` : ''}
                </div>
            </div>
        `
    }

    aplicarFiltros() {
        let resultado = [...this.chamados]

        // Filtro de busca
        if (this.filtros.busca) {
            const termo = this.filtros.busca.toLowerCase()
            resultado = resultado.filter(c => 
                c.id.toLowerCase().includes(termo) ||
                c.titulo.toLowerCase().includes(termo) ||
                c.solicitante_nome.toLowerCase().includes(termo) ||
                c.solicitante_email.toLowerCase().includes(termo) ||
                (c.descricao && c.descricao.toLowerCase().includes(termo))
            )
        }

        // Filtro de status
        if (this.filtros.status) {
            resultado = resultado.filter(c => c.status === this.filtros.status)
        }

        // Filtro de prioridade
        if (this.filtros.prioridade) {
            resultado = resultado.filter(c => c.prioridade === this.filtros.prioridade)
        }

        return resultado
    }

    setupFilters() {
        const debounceSearch = WMSUtils.debounce(() => {
            this.filtros.busca = document.getElementById('filtro-busca').value
            this.currentPage = 1
            this.renderPage()
        }, 300)

        document.getElementById('filtro-busca').addEventListener('input', debounceSearch)
        
        document.getElementById('filtro-status').addEventListener('change', (e) => {
            this.filtros.status = e.target.value
            this.currentPage = 1
            this.renderPage()
        })
        
        document.getElementById('filtro-prioridade').addEventListener('change', (e) => {
            this.filtros.prioridade = e.target.value
            this.currentPage = 1
            this.renderPage()
        })
    }

    restaurarFiltros() {
        if (this.filtros.busca) {
            document.getElementById('filtro-busca').value = this.filtros.busca
        }
        if (this.filtros.status) {
            document.getElementById('filtro-status').value = this.filtros.status
        }
        if (this.filtros.prioridade) {
            document.getElementById('filtro-prioridade').value = this.filtros.prioridade
        }
    }

    limparFiltros() {
        this.filtros = {}
        this.currentPage = 1
        this.renderPage()
    }

    changePage(page) {
        this.currentPage = page
        this.renderPage()
        // Scroll para o topo da tabela
        document.querySelector('.table').scrollIntoView({ behavior: 'smooth' })
    }

    async verDetalhes(id) {
        try {
            const chamado = await wmsDB.obterChamado(id)
            this.showDetalhesModal(chamado)
        } catch (error) {
            showToast(`Erro ao carregar detalhes: ${error.message}`, 'error')
        }
    }

    showDetalhesModal(chamado) {
        const modalContainer = document.getElementById('modal-detalhes')
        const statusInfo = WMSUtils.getStatusInfo(chamado.status)
        const priorityInfo = WMSUtils.getPriorityInfo(chamado.prioridade)

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content max-w-4xl">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-xl font-bold">Detalhes do Chamado</h3>
                        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Informações Básicas -->
                        <div>
                            <h4 class="font-medium mb-4">Informações do Chamado</h4>
                            <div class="space-y-3">
                                <div>
                                    <label class="text-sm font-medium text-gray-600">ID</label>
                                    <p class="font-mono">${chamado.id}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Título</label>
                                    <p>${chamado.titulo}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Descrição</label>
                                    <p class="whitespace-pre-wrap">${chamado.descricao || 'Não informado'}</p>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-sm font-medium text-gray-600">Status</label>
                                        <p>
                                            <span class="status-badge ${statusInfo.class}">
                                                <i class="${statusInfo.icon} mr-1"></i>
                                                ${statusInfo.label}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <label class="text-sm font-medium text-gray-600">Prioridade</label>
                                        <p>
                                            <span class="priority-badge ${priorityInfo.class}">
                                                <i class="${priorityInfo.icon} mr-1"></i>
                                                ${priorityInfo.label}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Informações do Solicitante -->
                        <div>
                            <h4 class="font-medium mb-4">Solicitante</h4>
                            <div class="space-y-3">
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Nome</label>
                                    <p>${chamado.solicitante_nome}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Email</label>
                                    <p><a href="mailto:${chamado.solicitante_email}" class="text-blue-600 hover:underline">${chamado.solicitante_email}</a></p>
                                </div>
                                ${chamado.solicitante_telefone ? `
                                    <div>
                                        <label class="text-sm font-medium text-gray-600">Telefone</label>
                                        <p>${WMSUtils.formatPhone(chamado.solicitante_telefone)}</p>
                                    </div>
                                ` : ''}
                                ${chamado.solicitante_setor ? `
                                    <div>
                                        <label class="text-sm font-medium text-gray-600">Setor</label>
                                        <p>${chamado.solicitante_setor}</p>
                                    </div>
                                ` : ''}
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Data de Abertura</label>
                                    <p>${WMSUtils.formatDate(chamado.data_abertura)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Histórico -->
                    ${chamado.historico && chamado.historico.length > 0 ? `
                        <div class="mt-6">
                            <h4 class="font-medium mb-4">Histórico</h4>
                            <div class="space-y-3 max-h-60 overflow-y-auto">
                                ${chamado.historico.map(h => `
                                    <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                                        <i class="fas fa-history text-gray-400 mt-1"></i>
                                        <div class="flex-1">
                                            <p class="font-medium">${h.acao}</p>
                                            <p class="text-sm text-gray-600">
                                                por ${h.usuario_nome} • ${WMSUtils.formatDate(h.created_at)}
                                            </p>
                                            ${h.detalhes ? `<p class="text-sm text-gray-700 mt-1">${h.detalhes}</p>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Ações -->
                    <div class="mt-6 flex justify-end space-x-3">
                        <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">
                            Fechar
                        </button>
                        ${chamado.status !== 'finalizada' && chamado.status !== 'cancelada' ? `
                            <button onclick="this.closest('.modal-overlay').remove(); wmsChamados.editarStatus('${chamado.id}', '${chamado.status}')" class="btn btn-primary">
                                <i class="fas fa-edit mr-2"></i>
                                Alterar Status
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `
    }

    editarStatus(id, statusAtual) {
        const statuses = [
            { value: 'aberta', label: 'Aberta', color: 'red' },
            { value: 'andamento', label: 'Em Andamento', color: 'yellow' },
            { value: 'finalizada', label: 'Finalizada', color: 'green' },
            { value: 'cancelada', label: 'Cancelada', color: 'gray' }
        ]

        const modalContainer = document.getElementById('modal-detalhes')
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h3 class="text-lg font-medium mb-4">Alterar Status do Chamado</h3>
                    
                    <form id="form-status">
                        <div class="form-group">
                            <label class="form-label">Novo Status</label>
                            <select id="novo-status" class="form-select" required>
                                ${statuses.filter(s => s.value !== statusAtual).map(s => `
                                    <option value="${s.value}">${s.label}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Seu Nome</label>
                            <input type="text" id="usuario-nome" class="form-input" 
                                   placeholder="Digite seu nome..." required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Observações (Opcional)</label>
                            <textarea id="observacoes" class="form-textarea" rows="3" 
                                      placeholder="Adicione observações sobre a alteração..."></textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save mr-2"></i>
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `

        document.getElementById('form-status').addEventListener('submit', async (e) => {
            e.preventDefault()
            
            const novoStatus = document.getElementById('novo-status').value
            const usuarioNome = document.getElementById('usuario-nome').value
            const observacoes = document.getElementById('observacoes').value

            try {
                await wmsDB.atualizarStatus(id, novoStatus, usuarioNome, observacoes)
                
                modalContainer.innerHTML = ''
                showToast('Status atualizado com sucesso!', 'success')
                
                // Recarregar lista
                await this.loadChamados()
            } catch (error) {
                showToast(`Erro ao atualizar status: ${error.message}`, 'error')
            }
        })
    }

    setupEventListeners() {
        // Listener para mudanças no database
        wmsDB.addChangeListener((event) => {
            if (event.type === 'chamado-criado' || event.type === 'status-atualizado' || event.type === 'sync-completa') {
                this.loadChamados()
            }
        })

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Fechar modals
                const modal = document.querySelector('.modal-overlay')
                if (modal) modal.remove()
            }
        })
    }
}

// Instância global
let wmsChamados

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    wmsChamados = new WMSChamados()
})