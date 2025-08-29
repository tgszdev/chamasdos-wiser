/**
 * WMS Database Client - Gerenciamento de dados unificado
 * Sincroniza com Cloudflare D1 via APIs para acesso cross-device
 */
class WMSDatabase {
    constructor() {
        this.baseUrl = '/api'
        this.cache = new Map()
        this.listeners = new Set()
        this.syncInterval = null
        
        this.initSync()
    }

    /**
     * Inicializa sincronização automática
     */
    initSync() {
        // Sincronizar a cada 30 segundos
        this.syncInterval = setInterval(() => {
            this.syncChamados()
        }, 30000)

        // Sincronizar quando a página ganha foco
        window.addEventListener('focus', () => {
            this.syncChamados()
        })

        // Sincronizar quando há conexão de rede
        window.addEventListener('online', () => {
            this.syncChamados()
        })
    }

    /**
     * Adicionar listener para mudanças
     */
    addChangeListener(callback) {
        this.listeners.add(callback)
    }

    /**
     * Remover listener
     */
    removeChangeListener(callback) {
        this.listeners.delete(callback)
    }

    /**
     * Notificar listeners sobre mudanças
     */
    notifyListeners(type, data) {
        this.listeners.forEach(callback => {
            try {
                callback({ type, data })
            } catch (error) {
                console.error('Erro no listener de database:', error)
            }
        })
    }

    /**
     * =====================================
     * MÉTODOS DE CHAMADOS
     * =====================================
     */

    /**
     * Criar novo chamado
     */
    async criarChamado(dados) {
        try {
            const response = await WMSUtils.apiRequest(`${this.baseUrl}/chamados`, {
                method: 'POST',
                body: JSON.stringify(dados)
            })

            this.cache.delete('chamados') // Limpar cache
            this.notifyListeners('chamado-criado', response.chamado)
            
            return response.chamado
        } catch (error) {
            console.error('Erro ao criar chamado:', error)
            throw error
        }
    }

    /**
     * Listar todos os chamados
     */
    async listarChamados(forceRefresh = false) {
        try {
            if (!forceRefresh && this.cache.has('chamados')) {
                return this.cache.get('chamados')
            }

            const response = await WMSUtils.apiRequest(`${this.baseUrl}/chamados`)
            
            this.cache.set('chamados', response.chamados)
            this.notifyListeners('chamados-carregados', response.chamados)
            
            return response.chamados
        } catch (error) {
            console.error('Erro ao listar chamados:', error)
            throw error
        }
    }

    /**
     * Obter chamado específico
     */
    async obterChamado(id, forceRefresh = false) {
        try {
            const cacheKey = `chamado-${id}`
            
            if (!forceRefresh && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey)
            }

            const response = await WMSUtils.apiRequest(`${this.baseUrl}/chamados/${id}`)
            
            this.cache.set(cacheKey, response.chamado)
            this.notifyListeners('chamado-carregado', response.chamado)
            
            return response.chamado
        } catch (error) {
            console.error('Erro ao obter chamado:', error)
            throw error
        }
    }

    /**
     * Atualizar status do chamado
     */
    async atualizarStatus(id, status, usuario_nome, observacoes = '') {
        try {
            const response = await WMSUtils.apiRequest(`${this.baseUrl}/chamados/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({
                    status,
                    usuario_nome,
                    observacoes
                })
            })

            // Limpar cache relacionado
            this.cache.delete('chamados')
            this.cache.delete(`chamado-${id}`)
            this.cache.delete('estatisticas')

            this.notifyListeners('status-atualizado', {
                chamadoId: id,
                statusAnterior: response.statusAnterior,
                statusNovo: response.statusNovo,
                usuario_nome,
                observacoes
            })
            
            return response
        } catch (error) {
            console.error('Erro ao atualizar status:', error)
            throw error
        }
    }

    /**
     * Filtrar chamados
     */
    async filtrarChamados(filtros = {}) {
        try {
            const chamados = await this.listarChamados()
            
            let resultado = [...chamados]

            if (filtros.status) {
                resultado = resultado.filter(c => c.status === filtros.status)
            }
            
            if (filtros.prioridade) {
                resultado = resultado.filter(c => c.prioridade === filtros.prioridade)
            }
            
            if (filtros.solicitante) {
                const termo = filtros.solicitante.toLowerCase()
                resultado = resultado.filter(c => 
                    c.solicitante_nome.toLowerCase().includes(termo) ||
                    c.solicitante_email.toLowerCase().includes(termo)
                )
            }
            
            if (filtros.titulo) {
                const termo = filtros.titulo.toLowerCase()
                resultado = resultado.filter(c => 
                    c.titulo.toLowerCase().includes(termo) ||
                    (c.descricao && c.descricao.toLowerCase().includes(termo))
                )
            }

            return resultado
        } catch (error) {
            console.error('Erro ao filtrar chamados:', error)
            throw error
        }
    }

    /**
     * =====================================
     * MÉTODOS DE ESTATÍSTICAS
     * =====================================
     */

    /**
     * Obter estatísticas
     */
    async obterEstatisticas(forceRefresh = false) {
        try {
            if (!forceRefresh && this.cache.has('estatisticas')) {
                return this.cache.get('estatisticas')
            }

            const response = await WMSUtils.apiRequest(`${this.baseUrl}/estatisticas`)
            
            this.cache.set('estatisticas', response.estatisticas)
            this.notifyListeners('estatisticas-carregadas', response.estatisticas)
            
            return response.estatisticas
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error)
            throw error
        }
    }

    /**
     * =====================================
     * MÉTODOS DE CONFIGURAÇÃO
     * =====================================
     */

    /**
     * Obter configuração SMTP
     */
    async obterConfigSMTP(forceRefresh = false) {
        try {
            if (!forceRefresh && this.cache.has('config-smtp')) {
                return this.cache.get('config-smtp')
            }

            const response = await WMSUtils.apiRequest(`${this.baseUrl}/config/smtp`)
            
            this.cache.set('config-smtp', response.smtp)
            
            return response.smtp
        } catch (error) {
            console.error('Erro ao obter config SMTP:', error)
            throw error
        }
    }

    /**
     * Salvar configuração SMTP
     */
    async salvarConfigSMTP(config) {
        try {
            const response = await WMSUtils.apiRequest(`${this.baseUrl}/config/smtp`, {
                method: 'POST',
                body: JSON.stringify(config)
            })

            this.cache.delete('config-smtp')
            this.notifyListeners('config-smtp-atualizada', config)
            
            return response
        } catch (error) {
            console.error('Erro ao salvar config SMTP:', error)
            throw error
        }
    }

    /**
     * =====================================
     * MÉTODOS DE EMAIL
     * =====================================
     */

    /**
     * Testar configuração de email
     */
    async testarEmail(testEmail, config = null) {
        try {
            if (!config) {
                config = await this.obterConfigSMTP()
            }

            const response = await WMSUtils.apiRequest(`${this.baseUrl}/email/test`, {
                method: 'POST',
                body: JSON.stringify({
                    testEmail,
                    config
                })
            })
            
            return response
        } catch (error) {
            console.error('Erro no teste de email:', error)
            throw error
        }
    }

    /**
     * =====================================
     * MÉTODOS DE SINCRONIZAÇÃO
     * =====================================
     */

    /**
     * Sincronizar chamados com servidor
     */
    async syncChamados() {
        try {
            // Recarregar dados do servidor
            await this.listarChamados(true)
            await this.obterEstatisticas(true)
            
            this.notifyListeners('sync-completa', { timestamp: Date.now() })
            
            return true
        } catch (error) {
            console.warn('Erro na sincronização:', error)
            return false
        }
    }

    /**
     * Forçar sincronização completa
     */
    async forceSyncAll() {
        try {
            // Limpar todo o cache
            this.cache.clear()
            
            // Recarregar todos os dados
            await Promise.all([
                this.listarChamados(true),
                this.obterEstatisticas(true),
                this.obterConfigSMTP(true)
            ])
            
            this.notifyListeners('sync-forcada', { timestamp: Date.now() })
            
            return true
        } catch (error) {
            console.error('Erro na sincronização forçada:', error)
            throw error
        }
    }

    /**
     * =====================================
     * MÉTODOS UTILITÁRIOS
     * =====================================
     */

    /**
     * Verificar status da API
     */
    async checkHealth() {
        try {
            const response = await WMSUtils.apiRequest(`${this.baseUrl}/health`)
            return response
        } catch (error) {
            console.error('Erro no health check:', error)
            throw error
        }
    }

    /**
     * Limpar cache
     */
    clearCache() {
        this.cache.clear()
        this.notifyListeners('cache-limpo', {})
    }

    /**
     * Destruir instância
     */
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval)
        }
        this.listeners.clear()
        this.cache.clear()
    }
}

// Instância global do database
window.wmsDB = new WMSDatabase()

// Expor para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WMSDatabase
}

// Log de inicialização
console.log('🗄️ WMS Database Client inicializado - Cloudflare D1 Backend')