import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Usa process.env para acessar variáveis de ambiente passadas pelo Docker ou Vercel
    const apiTarget = process.env.VITE_API_URL || process.env.VITE_API_TARGET || 'http://localhost:4000';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0', // Permite acesso de fora do container
        proxy: {
          // Redireciona requisições /api para o servidor backend
          '/api': {
            target: apiTarget,
            changeOrigin: true,
            secure: false,
          },
          // Redireciona uploads para o servidor backend
          '/uploads': {
            target: apiTarget,
            changeOrigin: true,
            secure: false,
          }
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
