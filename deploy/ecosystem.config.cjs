// PM2: pm2 start deploy/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'thanhvinh-web',
      cwd: '/var/www/thanhvinhmetal',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', NODE_OPTIONS: '--max-old-space-size=1024' },
      max_memory_restart: '1200M',
      out_file: '/var/log/thanhvinh/out.log',
      error_file: '/var/log/thanhvinh/error.log',
      time: true,
    },
  ],
}
