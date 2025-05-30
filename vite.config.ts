// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      wasm(),
    ],
    define: {
      'process.env': {},
      'import.meta.env.VITE_OPENAI_API_KEY_WORKER1': JSON.stringify(env.VITE_OPENAI_API_KEY_WORKER1 || ''),
      'import.meta.env.VITE_OPENAI_API_KEY_WORKER2': JSON.stringify(env.VITE_OPENAI_API_KEY_WORKER2 || '')
    },
  };
});