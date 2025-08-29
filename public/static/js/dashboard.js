/**
 * Dashboard do WMS Ticket System
 */
class WMSDashboard {
    constructor() {
        this.init()
    }

    async init() {
        await this.loadDashboard()
        this.setupEventListeners()
    }

    async loadDashboard() {
        const container = document.getElementById('dashboard-content')
        showLoading(container, 'Carregando dashboard...')

        try {
            const [estatisticas, chamados] = await Promise.all([
                wmsDB.obterEstatisticas(),
                wmsDB.listarChamados()
            ])

            container.innerHTML = this.renderDashboard(estatisticas, chamados)
            this.renderCharts(estatisticas, chamados)
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Erro ao carregar dashboard: ${error.message}
                </div>
            `
        }
    }

    renderDashboard(stats, chamados) {
        const chamadosRecentes = chamados.slice(0, 5)

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Cards de Estatísticas -->
                <div class="stat-card stat-card-primary">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Total</p>
                            <p class="text-2xl font-bold text-blue-600">${stats.total || 0}</p>
                        </div>
                        <div class="text-blue-500">
                            <i class="fas fa-ticket-alt text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div class="stat-card stat-card-danger">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Abertas</p>
                            <p class="text-2xl font-bold text-red-600">${stats.abertas || 0}</p>
                        </div>
                        <div class="text-red-500">
                            <i class="fas fa-exclamation-circle text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div class="stat-card stat-card-warning">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Em Andamento</p>
                            <p class="text-2xl font-bold text-yellow-600">${stats.andamento || 0}</p>
                        </div>
                        <div class="text-yellow-500">
                            <i class="fas fa-clock text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div class="stat-card stat-card-success">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Finalizadas</p>
                            <p class="text-2xl font-bold text-green-600">${stats.finalizadas || 0}</p>
                        </div>
                        <div class="text-green-500">
                            <i class="fas fa-check-circle text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Gráfico de Status -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-medium">Distribuição por Status</h3>
                    </div>
                    <div class="h-64">
                        <canvas id="statusChart"></canvas>
                    </div>
                </div>

                <!-- Gráfico de Prioridades -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-medium">Distribuição por Prioridade</h3>
                    </div>
                    <div class="h-64">
                        <canvas id="priorityChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Chamados Recentes -->
            <div class="mt-8">
                <div class="card">
                    <div class="card-header">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-medium">Chamados Recentes</h3>
                            <a href="/chamados" class="btn btn-primary btn-sm">
                                Ver Todos <i class="fas fa-arrow-right ml-1"></i>
                            </a>
                        </div>
                    </div>
                    
                    ${chamadosRecentes.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Título</th>
                                        <th>Status</th>
                                        <th>Prioridade</th>
                                        <th>Solicitante</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${chamadosRecentes.map(chamado => `
                                        <tr onclick="window.location.href='/chamados?id=${chamado.id}'" class="cursor-pointer hover:bg-gray-50">
                                            <td class="font-mono text-sm">${chamado.id}</td>
                                            <td class="font-medium">${WMSUtils.truncate(chamado.titulo, 40)}</td>
                                            <td>
                                                <span class="status-badge ${WMSUtils.getStatusInfo(chamado.status).class}">
                                                    ${WMSUtils.getStatusInfo(chamado.status).label}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="priority-badge ${WMSUtils.getPriorityInfo(chamado.prioridade).class}">
                                                    ${WMSUtils.getPriorityInfo(chamado.prioridade).label}
                                                </span>
                                            </td>
                                            <td>${chamado.solicitante_nome}</td>
                                            <td class="text-sm text-gray-500">
                                                ${WMSUtils.formatRelativeDate(chamado.data_abertura)}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-inbox text-4xl mb-4"></i>
                            <p>Nenhum chamado encontrado</p>
                            <a href="/novo-chamado" class="btn btn-primary mt-4">
                                Criar Primeiro Chamado
                            </a>
                        </div>
                    `}
                </div>
            </div>

            <!-- Ações Rápidas -->
            <div class="mt-8">
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-medium">Ações Rápidas</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="/novo-chamado" class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <i class="fas fa-plus text-blue-500 text-xl mr-3"></i>
                            <div>
                                <p class="font-medium">Novo Chamado</p>
                                <p class="text-sm text-gray-600">Criar novo chamado</p>
                            </div>
                        </a>
                        
                        <a href="/chamados?status=aberta" class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <i class="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
                            <div>
                                <p class="font-medium">Chamados Abertos</p>
                                <p class="text-sm text-gray-600">Ver chamados pendentes</p>
                            </div>
                        </a>
                        
                        <a href="/configuracoes" class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <i class="fas fa-cog text-gray-500 text-xl mr-3"></i>
                            <div>
                                <p class="font-medium">Configurações</p>
                                <p class="text-sm text-gray-600">Configurar sistema</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        `
    }

    renderCharts(stats, chamados) {
        // Carregar Chart.js se não estiver carregado
        if (!window.Chart) {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
            script.onload = () => this.createCharts(stats, chamados)
            document.head.appendChild(script)
        } else {
            this.createCharts(stats, chamados)
        }
    }

    createCharts(stats, chamados) {
        // Gráfico de Status
        const statusCtx = document.getElementById('statusChart')
        if (statusCtx) {
            new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Abertas', 'Em Andamento', 'Finalizadas'],
                    datasets: [{
                        data: [stats.abertas || 0, stats.andamento || 0, stats.finalizadas || 0],
                        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            })
        }

        // Gráfico de Prioridades
        const priorityCtx = document.getElementById('priorityChart')
        if (priorityCtx && stats.prioridades) {
            const prioData = stats.prioridades.reduce((acc, p) => {
                acc[p.prioridade] = p.count
                return acc
            }, {})

            new Chart(priorityCtx, {
                type: 'bar',
                data: {
                    labels: ['Baixa', 'Média', 'Alta', 'Urgente'],
                    datasets: [{
                        label: 'Chamados',
                        data: [
                            prioData.baixa || 0,
                            prioData.media || 0,
                            prioData.alta || 0,
                            prioData.urgente || 0
                        ],
                        backgroundColor: ['#3b82f6', '#f59e0b', '#f97316', '#ef4444'],
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            })
        }
    }

    setupEventListeners() {
        // Listener para sincronização
        wmsDB.addChangeListener((event) => {
            if (event.type === 'sync-completa' || event.type === 'chamado-criado' || event.type === 'status-atualizado') {
                this.loadDashboard()
            }
        })

        // Atualizar dashboard a cada 5 minutos
        setInterval(() => {
            this.loadDashboard()
        }, 5 * 60 * 1000)
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new WMSDashboard()
})