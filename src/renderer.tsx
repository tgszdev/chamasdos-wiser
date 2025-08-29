import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>WMS Ticket System</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/css/styles.css" rel="stylesheet" />
      </head>
      <body class="bg-gray-50">
        <nav class="bg-blue-600 text-white p-4">
          <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <i class="fas fa-ticket-alt text-2xl"></i>
              <h1 class="text-xl font-bold">WMS Ticket System</h1>
            </div>
            <div class="flex space-x-4">
              <a href="/" class="hover:bg-blue-700 px-3 py-2 rounded"><i class="fas fa-home mr-2"></i>Home</a>
              <a href="/dashboard" class="hover:bg-blue-700 px-3 py-2 rounded"><i class="fas fa-chart-bar mr-2"></i>Dashboard</a>
              <a href="/chamados" class="hover:bg-blue-700 px-3 py-2 rounded"><i class="fas fa-list mr-2"></i>Chamados</a>
              <a href="/novo-chamado" class="hover:bg-blue-700 px-3 py-2 rounded"><i class="fas fa-plus mr-2"></i>Novo</a>
              <a href="/configuracoes" class="hover:bg-blue-700 px-3 py-2 rounded"><i class="fas fa-cog mr-2"></i>Config</a>
            </div>
          </div>
        </nav>
        <main class="container mx-auto p-6">
          {children}
        </main>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/js/database.js"></script>
        <script src="/static/js/utils.js"></script>
      </body>
    </html>
  )
})
