/**
 * WMS Ticket System - Utility Functions
 * Funções utilitárias para o frontend
 */

class WMSUtils {
    /**
     * Formatar data para exibição em português
     */
    static formatDate(dateString, includeTime = true) {
        if (!dateString) return '-'
        
        const date = new Date(dateString)
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }
        
        if (includeTime) {
            options.hour = '2-digit'
            options.minute = '2-digit'
        }
        
        return date.toLocaleString('pt-BR', options)
    }

    /**
     * Formatar data relativa (há 2 horas, ontem, etc.)
     */
    static formatRelativeDate(dateString) {
        if (!dateString) return '-'
        
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        
        if (days > 7) {
            return this.formatDate(dateString, false)
        } else if (days > 0) {
            return `há ${days} dia${days > 1 ? 's' : ''}`
        } else if (hours > 0) {
            return `há ${hours} hora${hours > 1 ? 's' : ''}`
        } else if (minutes > 0) {
            return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`
        } else {
            return 'agora mesmo'
        }
    }

    /**
     * Validar email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    /**
     * Validar telefone brasileiro
     */
    static isValidPhone(phone) {
        if (!phone) return true // Opcional
        const phoneRegex = /^\(?([0-9]{2})\)?\s?([0-9]{4,5})\-?([0-9]{4})$/
        return phoneRegex.test(phone.replace(/\s/g, ''))
    }

    /**
     * Formatar telefone brasileiro
     */
    static formatPhone(phone) {
        if (!phone) return ''
        const cleaned = phone.replace(/\D/g, '')
        
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`
        }
        
        return phone
    }

    /**
     * Obter cor e ícone para status
     */
    static getStatusInfo(status) {
        const statusMap = {
            'aberta': {
                color: 'red',
                icon: 'fas fa-exclamation-circle',
                label: 'Aberta',
                class: 'status-aberta'
            },
            'andamento': {
                color: 'yellow',
                icon: 'fas fa-clock',
                label: 'Em Andamento',
                class: 'status-andamento'
            },
            'finalizada': {
                color: 'green',
                icon: 'fas fa-check-circle',
                label: 'Finalizada',
                class: 'status-finalizada'
            },
            'cancelada': {
                color: 'gray',
                icon: 'fas fa-times-circle',
                label: 'Cancelada',
                class: 'status-cancelada'
            }
        }
        
        return statusMap[status] || statusMap['aberta']
    }

    /**
     * Obter cor e ícone para prioridade
     */
    static getPriorityInfo(priority) {
        const priorityMap = {
            'baixa': {
                color: 'blue',
                icon: 'fas fa-arrow-down',
                label: 'Baixa',
                class: 'priority-baixa'
            },
            'media': {
                color: 'yellow',
                icon: 'fas fa-minus',
                label: 'Média',
                class: 'priority-media'
            },
            'alta': {
                color: 'orange',
                icon: 'fas fa-arrow-up',
                label: 'Alta',
                class: 'priority-alta'
            },
            'urgente': {
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                label: 'Urgente',
                class: 'priority-urgente'
            }
        }
        
        return priorityMap[priority] || priorityMap['media']
    }

    /**
     * Mostrar notificação toast
     */
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div')
        toast.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 fade-in alert alert-${type}`
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle mr-2"></i>
                <span>${message}</span>
                <button class="ml-4 text-current opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `
        
        document.body.appendChild(toast)
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove()
            }
        }, duration)
    }

    /**
     * Mostrar modal de confirmação
     */
    static showConfirm(title, message, onConfirm, onCancel = null) {
        const modal = document.createElement('div')
        modal.className = 'modal-overlay'
        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="text-lg font-medium mb-4">${title}</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex justify-end space-x-3">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); ${onCancel ? onCancel.toString() + '()' : ''}">
                        Cancelar
                    </button>
                    <button class="btn btn-danger" onclick="this.closest('.modal-overlay').remove(); (${onConfirm.toString()})()">
                        Confirmar
                    </button>
                </div>
            </div>
        `
        
        document.body.appendChild(modal)
        
        // Fechar modal ao clicar no overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove()
                if (onCancel) onCancel()
            }
        })
    }

    /**
     * Mostrar loading
     */
    static showLoading(element, text = 'Carregando...') {
        element.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <div class="loading mr-3"></div>
                <span class="text-gray-600">${text}</span>
            </div>
        `
    }

    /**
     * Debounce function
     */
    static debounce(func, wait) {
        let timeout
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }

    /**
     * Escapar HTML
     */
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }
        return text.replace(/[&<>"']/g, (m) => map[m])
    }

    /**
     * Truncar texto
     */
    static truncate(text, length = 100) {
        if (!text) return ''
        if (text.length <= length) return text
        return text.substring(0, length) + '...'
    }

    /**
     * Gerar cores para gráficos
     */
    static getChartColors(count) {
        const colors = [
            '#3b82f6', '#ef4444', '#f59e0b', '#10b981',
            '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
        ]
        
        const result = []
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length])
        }
        
        return result
    }

    /**
     * Fazer requisição HTTP com tratamento de erro
     */
    static async apiRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`)
            }
            
            return data
        } catch (error) {
            console.error('API Request Error:', error)
            this.showToast(`Erro: ${error.message}`, 'error')
            throw error
        }
    }

    /**
     * Sincronizar com servidor (para uso futuro com WebSocket ou polling)
     */
    static async syncWithServer() {
        try {
            // Placeholder para sincronização futura
            console.log('Sincronizando com servidor...')
            return true
        } catch (error) {
            console.error('Erro na sincronização:', error)
            return false
        }
    }
}

// Expor globalmente
window.WMSUtils = WMSUtils

// Shortcuts globais
window.formatDate = WMSUtils.formatDate.bind(WMSUtils)
window.formatRelativeDate = WMSUtils.formatRelativeDate.bind(WMSUtils)
window.showToast = WMSUtils.showToast.bind(WMSUtils)
window.showConfirm = WMSUtils.showConfirm.bind(WMSUtils)
window.showLoading = WMSUtils.showLoading.bind(WMSUtils)