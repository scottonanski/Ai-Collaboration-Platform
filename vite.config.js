// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [
            react(),
            tailwindcss(),
            wasm(),
        ],
        define: {
            'import.meta.env.OPENAI_API_KEY_WORKER1': JSON.stringify(env.OPENAI_API_KEY_WORKER1),
            'import.meta.env.OPENAI_API_KEY_WORKER2': JSON.stringify(env.OPENAI_API_KEY_WORKER2),
        },
    };
});
