import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
        open: true,
        proxy: {
            '/ollama': {
                target: 'http://localhost:11434',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ollama/, '')
            }
        }
    }
});
