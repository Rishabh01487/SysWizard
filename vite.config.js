import { defineConfig } from 'vite';

// GitHub Pages needs /SysWizard/ base; Vercel & local dev use /
const base = process.env.GITHUB_PAGES === 'true' ? '/SysWizard/' : '/';

export default defineConfig({
    base,
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
