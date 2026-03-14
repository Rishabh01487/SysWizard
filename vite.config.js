import { defineConfig } from 'vite';

export default defineConfig({
    base: '/SysWizard/',   // GitHub Pages serves from this subdirectory
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
