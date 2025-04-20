import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true, // Enables global `describe`, `it`, `expect`, etc.
    setupFiles: ['./vitest.setup.ts'], // Optional setup file for custom matchers
  },
});