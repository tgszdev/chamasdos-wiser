module.exports = {
  apps: [
    {
      name: 'wms-chamados-smtp',
      script: 'npx',
      args: 'tsx src/index.tsx',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'dist'],
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log'
    }
  ]
}